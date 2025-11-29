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
    const contextLimitDominio = parseInt(process.env.CONTEXT_LIMIT_DOMINIO || '20', 10);
    const contextLimitIp = parseInt(process.env.CONTEXT_LIMIT_IP || '20', 10);
    const contextLimitPorta = parseInt(process.env.CONTEXT_LIMIT_PORTA || '20', 10);
    const contextLimitDiretorio = parseInt(process.env.CONTEXT_LIMIT_DIRETORIO || '20', 10);
    const contextLimitUsuario = parseInt(process.env.CONTEXT_LIMIT_USUARIO || '20', 10);
    const contextLimitDeface = parseInt(process.env.CONTEXT_LIMIT_DEFACE || '20', 10);
    const contextLimitWhatweb = parseInt(process.env.CONTEXT_LIMIT_WHATWEB || '20', 10);

    const projeto = await prisma.projeto.findUnique({ where: { id: projectId } });
    if (!projeto) return null;

    const dominios = await prisma.dominio.findMany({
        where: { projetoId: projectId },
        take: contextLimitDominio
    });

    const ips = await prisma.ip.findMany({
        where: { projetoId: projectId },
        take: contextLimitIp
    });

    const portas = await prisma.porta.findMany({
        where: { ip: { projetoId: projectId } },
        take: contextLimitPorta,
        include: { ip: true }
    });

    const diretorios = await prisma.diretorio.findMany({
        where: { OR: [{ dominio: { projetoId: projectId } }, { ip: { projetoId: projectId } }] },
        take: contextLimitDiretorio,
        include: { dominio: true, ip: true }
    });

    const usuarios = await prisma.usuario.findMany({
        where: { ip: { projetoId: projectId } },
        take: contextLimitUsuario,
        include: { ip: true }
    });

    const defaces = await prisma.deface.findMany({
        where: { dominio: { projetoId: projectId } },
        take: contextLimitDeface,
        include: { dominio: true }
    });

    const resultadosWhatweb = await prisma.whatwebResultado.findMany({
        where: { OR: [{ dominio: { projetoId: projectId } }, { ip: { projetoId: projectId } }] },
        take: contextLimitWhatweb,
        include: { dominio: true, ip: true }
    });

    return {
        projeto: projeto.nome,
        dominios: dominios.map(d => d.endereco),
        ips: ips.map(i => i.endereco),
        portas: portas.map(p => `${p.ip?.endereco}:${p.numero}/${p.protocolo || 'tcp'} (${p.servico || 'unknown'})`),
        diretorios: diretorios.map(d => d.caminho),
        usuarios: usuarios.map(u => `${u.nome}@${u.ip.endereco}`),
        deface: defaces.map(d => `URL: ${d.url}, Fonte: ${d.fonte}`),
        whatweb: resultadosWhatweb.map(r => `${r.plugin}: ${r.valor} (${r.dominio?.endereco || r.ip?.endereco || 'alvo desconhecido'})`)
    };
  }

  async generateResponse(projectId: number, messages: any[]) {
      const context = await this.getProjectContext(projectId);
      const systemPrompt = `
Você é um Assistente de Red Team em um Kali Linux.
Seu objetivo é auxiliar o usuário em operações de CTF ou Red Team, analisando os achados atuais e sugerindo os próximos passos.

CONTEXTO (Achados Atuais do Projeto):
${JSON.stringify(context, null, 2)}

INSTRUÇÕES:
1. Analise o contexto e a solicitação do usuário.
2. Forneça insights, explicações ou vetores de ataque em potencial.
3. Você pode sugerir comandos para coletar mais informações ou explorarulnerabilidades.
4. Ao sugerir um comando, você DEVE formatá-lo como um objeto JSON válido em sua própria linha, seguindo esta estrutura exatamente:
   {"COMANDO":"NOME_DO_COMANDO", "PARAMETRO1":"VALOR"}

   Comandos Suportados:
   - AMASS (Enumeração de Subdomínios): {"COMANDO":"AMASS", "PARAMETRO1":"dominio.com"}
   - NMAP (Scan de Portas): {"COMANDO":"NMAP", "PARAMETRO1":"endereco_ip"}
   - WHATWEB (Fingerprint de serviços): {"COMANDO":"WHATWEB", "PARAMETRO1":"alvo"}
   - HACKEDBY (Pesquisa Google Hacking): {"COMANDO":"HACKEDBY", "PARAMETRO1":"dominio.com"}
   - PWNEDBY (Pesquisa Google Hacking): {"COMANDO":"PWNEDBY", "PARAMETRO1":"dominio.com"}

   Exemplos:
   Para escanear example.com:
   {"COMANDO":"AMASS", "PARAMETRO1":"example.com"}

   Para escanear o IP 192.168.1.1:
   {"COMANDO":"NMAP", "PARAMETRO1":"192.168.1.1"}

   Para fingerprint em example.com:
   {"COMANDO":"WHATWEB", "PARAMETRO1":"example.com"}

   Para verificar defacement em example.com:
   {"COMANDO":"HACKEDBY", "PARAMETRO1":"example.com"}

5. NÃO envolva o comando JSON em blocos de código markdown (como \`\`\`json ... \`\`\`). Apenas escreva a string JSON bruta em uma nova linha.
6. Você pode explicar por que está sugerindo o comando antes ou depois do JSON.

AMBIENTE:
- Você está em uma máquina Kali Linux.
- Você tem acesso a ferramentas padrão (nmap, amass, etc.).
      `;

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
