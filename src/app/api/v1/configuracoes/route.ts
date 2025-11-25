import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const envFilePath = path.resolve(process.cwd(), '.env.local');

// Função auxiliar para ler e analisar o arquivo .env.local
async function readEnvFile(): Promise<Record<string, string>> {
    try {
        const content = await fs.readFile(envFilePath, 'utf-8');
        const lines = content.split('\n');
        const env: Record<string, string> = {};
        for (const line of lines) {
            if (line.trim() && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').replace(/["']/g, ''); // Remove aspas
                if (key) {
                    env[key.trim()] = value.trim();
                }
            }
        }
        return env;
    } catch (error) {
        // Se o arquivo não existir, retorna um objeto vazio
        return {};
    }
}

// Retorna placeholders para chaves e valores reais para outros campos
export async function GET() {
    const env = await readEnvFile();
    const clientConfig = {
        openaiApiKey: env.OPENAI_API_KEY ? '••••••••••••••••' : '',
        openaiApiModel: env.OPENAI_API_MODEL || '',
        googleApiKey: env.GOOGLE_API_KEY ? '••••••••••••••••' : '',
        googleSearchEngineId: env.GOOGLE_SEARCH_ENGINE_ID || '',
    };
    return NextResponse.json(clientConfig);
}

// Atualiza o arquivo .env.local e o process.env
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const currentEnv = await readEnvFile();

        // Atualiza apenas as chaves que foram enviadas e não são placeholders
        for (const key in body) {
            const value = body[key];
            if (value && !value.includes('••••')) {
                const envKey = {
                    openaiApiKey: 'OPENAI_API_KEY',
                    openaiApiModel: 'OPENAI_API_MODEL',
                    googleApiKey: 'GOOGLE_API_KEY',
                    googleSearchEngineId: 'GOOGLE_SEARCH_ENGINE_ID',
                }[key];

                if (envKey) {
                    currentEnv[envKey] = value;
                    process.env[envKey] = value; // Atualiza o process.env em tempo de execução
                }
            }
        }

        const newEnvContent = Object.entries(currentEnv)
            .map(([key, value]) => `${key}="${value}"`)
            .join('\n');

        await fs.writeFile(envFilePath, newEnvContent);

        return NextResponse.json({ message: 'Configurações salvas com sucesso!' });
    } catch (error) {
        console.error("Erro ao salvar .env.local:", error);
        return NextResponse.json({ error: 'Falha ao salvar configurações.' }, { status: 500 });
    }
}
