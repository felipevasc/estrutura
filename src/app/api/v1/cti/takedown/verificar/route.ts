
import { NextRequest, NextResponse } from 'next/server';
import EventBus from '@/service/nano/EventBus';
import { NanoEvents } from '@/service/nano/events';

// POST /api/v1/cti/takedown/verificar
export async function POST(request: NextRequest) {
    try {
        const { ids, projetoId } = await request.json();
        if (!ids || !Array.isArray(ids) || ids.length === 0 || !projetoId) {
            return NextResponse.json({ error: 'Uma lista de IDs e o ID do projeto são obrigatórios' }, { status: 400 });
        }

        for (const id of ids) {
            // Emite o evento diretamente para execução imediata, sem persistir no banco
            EventBus.emit(NanoEvents.COMMAND_RECEIVED, {
                id: `takedown-check-${id}-${Date.now()}`, // ID único e efêmero
                command: 'takedown_check',
                args: { id },
                projectId: projetoId,
            });
        }

        return NextResponse.json({ message: `${ids.length} verificações de takedown foram iniciadas.` });

    } catch (error) {
        console.error("Erro ao iniciar verificação de takedown:", error);
        return NextResponse.json({ error: 'Erro ao iniciar verificações' }, { status: 500 });
    }
}
