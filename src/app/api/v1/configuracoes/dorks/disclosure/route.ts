
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const CONFIG_PATH = path.join(process.cwd(), 'src/config/dorks_disclosure.json');

export async function GET() {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        // Se arquivo não existe, retorna vazio ou erro controlado
        return NextResponse.json({}, { status: 200 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Validação básica se necessário

        await fs.writeFile(CONFIG_PATH, JSON.stringify(body, null, 2), 'utf-8');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
