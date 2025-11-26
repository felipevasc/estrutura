
import { NextRequest, NextResponse } from 'next/server';
import { queueCommand } from '@/service/nano/commandHelper';

// POST /api/v1/cti/takedown/verificar
export async function POST(request: NextRequest) {
    try {
        const { ids, projetoId } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0 || !projetoId) {
            return NextResponse.json({ error: 'Uma lista de IDs e o ID do projeto são obrigatórios' }, { status: 400 });
        }

        for (const id of ids) {
            await queueCommand({
                command: 'takedown_check',
                args: JSON.stringify({ id }),
                projectId: projetoId,
            });
        }

        return NextResponse.json({ message: `${ids.length} verificações de takedown foram enfileiradas.` });

    } catch (error) {
        console.error("Erro ao enfileirar verificação de takedown:", error);
        return NextResponse.json({ error: 'Erro ao enfileirar verificações' }, { status: 500 });
    }
}
