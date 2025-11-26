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

// Função auxiliar para atualizar o .env.local de forma segura
async function updateEnvFile(newValues: Record<string, string>) {
    let content = '';
    try {
        content = await fs.readFile(envFilePath, 'utf-8');
    } catch (error) {
        // Se o arquivo não existir, será criado.
    }

    const lines = content.split('\n');
    const keysToUpdate = { ...newValues };

    // Atualiza as chaves existentes
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const key in keysToUpdate) {
            if (line.trim().startsWith(`${key}=`)) {
                lines[i] = `${key}="${keysToUpdate[key]}"`;
                delete keysToUpdate[key]; // Remove a chave que já foi atualizada
                break;
            }
        }
    }

    // Adiciona as novas chaves que não existiam
    for (const key in keysToUpdate) {
        lines.push(`${key}="${keysToUpdate[key]}"`);
    }

    const newContent = lines.join('\n');
    await fs.writeFile(envFilePath, newContent);
}


// Atualiza o arquivo .env.local e o process.env
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const envUpdates: Record<string, string> = {};

        const keyMap: Record<string, string> = {
            openaiApiKey: 'OPENAI_API_KEY',
            openaiApiModel: 'OPENAI_API_MODEL',
            googleApiKey: 'GOOGLE_API_KEY',
            googleSearchEngineId: 'GOOGLE_SEARCH_ENGINE_ID',
        };

        for (const frontendKey in body) {
            const value = body[frontendKey];
            if (value && !value.includes('••••')) {
                const envKey = keyMap[frontendKey];
                if (envKey) {
                    envUpdates[envKey] = value;
                    process.env[envKey] = value; // Atualiza o processo em execução
                }
            }
        }

        if (Object.keys(envUpdates).length > 0) {
            await updateEnvFile(envUpdates);
        }

        return NextResponse.json({ message: 'Configurações salvas com sucesso!' });
    } catch (error) {
        console.error("Erro ao salvar .env.local:", error);
        return NextResponse.json({ error: 'Falha ao salvar configurações.' }, { status: 500 });
    }
}
