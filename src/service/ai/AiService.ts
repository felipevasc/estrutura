import OpenAI from 'openai';
import prisma from '@/database';

export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getProjectContext(projectId: number) {
    const project = await prisma.projeto.findUnique({
      where: { id: projectId },
      include: {
        dominios: {
            include: {
                ips: true
            }
        },
        ips: {
            include: {
                portas: true,
                usuarios: true
            }
        }
      }
    });

    if (!project) return null;

    // Formatting context to be token-efficient but informative
    return {
        project: project.nome,
        domains: project.dominios.map(d => ({
            // We expose ID to the LLM?
            // Better to keep it using Names/IPs as "Human Language".
            // The Interpreter will resolve them.
            name: d.endereco,
            ips: d.ips.map(ip => ip.endereco)
        })),
        ips: project.ips.map(ip => ({
            address: ip.endereco,
            ports: ip.portas.map(p => `${p.numero}/${p.protocolo || 'tcp'} (${p.servico || 'unknown'})`),
            users: ip.usuarios.map(u => u.nome)
        }))
    };
  }

  async generateResponse(projectId: number, messages: any[]) {
      const context = await this.getProjectContext(projectId);
      const systemPrompt = `
You are a Red Team Assistant running on Kali Linux.
Your goal is to assist the user in CTF or Red Team operations by analyzing the current findings and suggesting next steps.

CONTEXT (Current Project Findings):
${JSON.stringify(context, null, 2)}

INSTRUCTIONS:
1. Analyze the context and the user's request.
2. Provide insights, explanations, or potential attack vectors.
3. You can suggest commands to run to gather more info or exploit vulnerabilities.
4. When you suggest a command, you MUST format it as a valid JSON object on its own line, following this structure exactly:
   {"COMANDO":"COMMAND_NAME", "PARAMETRO1":"VALUE"}

   Supported Commands:
   - AMASS (Subdomain Enumeration): {"COMANDO":"AMASS", "PARAMETRO1":"domain.com"}
   - NMAP (Port Scanning): {"COMANDO":"NMAP", "PARAMETRO1":"ip_address"}

   Examples:
   To scan example.com:
   {"COMANDO":"AMASS", "PARAMETRO1":"example.com"}

   To scan IP 192.168.1.1:
   {"COMANDO":"NMAP", "PARAMETRO1":"192.168.1.1"}

5. Do NOT wrap the JSON command in markdown code blocks (like \`\`\`json ... \`\`\`). Just write the raw JSON string on a new line.
6. You can explain why you are suggesting the command before or after the JSON.

ENVIRONMENT:
- You are running on a Kali Linux machine.
- You have access to standard tools (nmap, amass, etc.).
      `;

      // We only keep the last N messages to avoid hitting token limits if context is huge
      // But for now, let's pass all messages provided by frontend (which usually manages history).
      // We prepend the system prompt.

      const conversation = [
          { role: 'system', content: systemPrompt },
          ...messages
      ];

      try {
        const completion = await this.openai.chat.completions.create({
            messages: conversation as any,
            model: process.env.OPENAI_MODEL || 'gpt-4',
            temperature: 0.7,
        });

        return completion.choices[0].message.content;
      } catch (error: any) {
          console.error("OpenAI API Error:", error);
          throw new Error(`AI Service Error: ${error.message}`);
      }
  }
}

export default new AiService();
