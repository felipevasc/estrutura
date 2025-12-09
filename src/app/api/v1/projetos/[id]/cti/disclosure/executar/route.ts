
import { NextRequest, NextResponse } from 'next/server';
import { queueCommand } from '@/service/nano/commandHelper';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { dominioId, ferramenta, grupo, ...extras } = body;

        if (!dominioId) {
            return NextResponse.json({ error: 'Domínio é obrigatório.' }, { status: 400 });
        }

        // Mapear comandos
        let command = '';
        const args: any = { dominioId, ...extras };

        if (grupo === 'dorks') {
            command = 'info_disclosure_check';
            args.category = ferramenta;
        } else if (grupo === 'repositorios') {
            command = 'info_disclosure_codigo';
        } else if (grupo === 'pastes') {
            command = 'info_disclosure_paste';
        } else {
            return NextResponse.json({ error: 'Ferramenta desconhecida.' }, { status: 400 });
        }

        await queueCommand(command, JSON.stringify(args), parseInt(id));

        return NextResponse.json({ success: true, message: 'Comando enfileirado.' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
