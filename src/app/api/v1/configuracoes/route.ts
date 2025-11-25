import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const configFilePath = path.resolve(process.cwd(), 'config.json');

// Função para ler as configurações, mesclando .env e config.json
async function getAppConfig() {
  const config = {
    openaiApiKey: process.env.OPENAI_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
    googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
  };

  try {
    const fileContent = await fs.readFile(configFilePath, 'utf-8');
    const fileConfig = JSON.parse(fileContent);
    Object.assign(config, fileConfig);
  } catch (error) {
    // Arquivo não existe ou é inválido, ignora.
  }

  return config;
}

// Retorna apenas se as chaves estão definidas, não os valores.
export async function GET() {
  const config = await getAppConfig();
  const clientConfig = {
    openaiConfigurado: !!config.openaiApiKey,
    googleConfigurado: !!config.googleApiKey && !!config.googleSearchEngineId,
  };
  return NextResponse.json(clientConfig);
}

// Salva as configurações no arquivo JSON.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currentConfig = await getAppConfig();

    // Filtra chaves com valores vazios antes de mesclar
    const updates: { [key: string]: any } = {};
    for (const key in body) {
      if (body[key] !== null && body[key] !== '') {
        updates[key] = body[key];
      }
    }

    const newConfig = { ...currentConfig, ...updates };

    await fs.writeFile(configFilePath, JSON.stringify(newConfig, null, 2));

    return NextResponse.json({ message: 'Configurações salvas com sucesso!' });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao salvar configurações.' }, { status: 500 });
  }
}
