import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildProjectContext } from "@/service/ai/projectContext";
import { ChatMessage } from "@/types/AiChat";

const AVAILABLE_COMMANDS = `Comandos disponíveis (sempre use o JSON exato com a chave COMANDO):
- AMASS: {"COMANDO":"AMASS","DOMINIO":"dominio.com"}
- SUBFINDER: {"COMANDO":"SUBFINDER","DOMINIO":"dominio.com"}
- NSLOOKUP: {"COMANDO":"NSLOOKUP","DOMINIO":"dominio.com"}
- NMAP: {"COMANDO":"NMAP","IP":"1.2.3.4"}
- ENUM4LINUX: {"COMANDO":"ENUM4LINUX","IP":"1.2.3.4"}
- FFUF: {"COMANDO":"FFUF","ALVO":"dominio.com ou 1.2.3.4"}`;

const SYSTEM_PROMPT = `Você é um assistente tático para Red Team e CTF atuando em um ambiente Kali Linux com ferramentas já instaladas.
Regras:
1. Utilize apenas os comandos listados e, quando sugerir execução automática, envie um JSON independente no formato {"COMANDO":"NOME","PARAMETRO":"VALOR"} seguindo os exemplos acima.
2. Estruture recomendações objetivas, priorizando próximos passos.
3. Baseie-se no contexto enviado. Se faltar dado, peça de forma direta.
4. Explique rapidamente o porquê de cada sugestão e mantenha respostas curtas e práticas.`;

export async function POST(request: Request) {
    try {
        const { projectId, messages } = await request.json() as { projectId?: number, messages?: ChatMessage[] };

        if (!projectId) {
            return NextResponse.json({ message: "projectId é obrigatório" }, { status: 400 });
        }

        if (!process.env.OPENAI_KEY) {
            return NextResponse.json({ message: "OPENAI_KEY não configurada" }, { status: 500 });
        }

        const normalizedMessages = (messages || []).map((msg) => ({
            role: msg.role,
            content: msg.content,
        })) as ChatMessage[];

        const context = await buildProjectContext(projectId);

        const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        const completion = await openai.chat.completions.create({
            model,
            temperature: 0.2,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'system', content: AVAILABLE_COMMANDS },
                { role: 'system', content: `Contexto do projeto:\n${context}` },
                ...normalizedMessages,
            ],
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            return NextResponse.json({ message: "Resposta vazia da IA" }, { status: 500 });
        }

        return NextResponse.json({ content });
    } catch (error: unknown) {
        console.error("[IA Chat]", error);
        const message = error instanceof Error ? error.message : 'Erro ao conversar com a IA';
        return NextResponse.json({ message }, { status: 500 });
    }
}
