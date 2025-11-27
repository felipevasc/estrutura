import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const CONFIG_PATH = path.join(process.cwd(), 'src/config/dorks.json');

export async function GET() {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        console.error("Erro ao ler dorks.json:", error);
        return NextResponse.json({ error: "Falha ao ler configuração de dorks" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation: keys should be strings, values arrays of strings
        for (const [key, value] of Object.entries(body)) {
            if (!Array.isArray(value)) {
                 return NextResponse.json({ error: `O valor para '${key}' deve ser uma lista de strings.` }, { status: 400 });
            }
        }

        await fs.writeFile(CONFIG_PATH, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ message: "Configuração salva com sucesso" });
    } catch (error) {
        console.error("Erro ao salvar dorks.json:", error);
        return NextResponse.json({ error: "Falha ao salvar configuração" }, { status: 500 });
    }
}
