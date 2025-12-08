import { NextResponse } from 'next/server';
import prisma from '@/database';
import { CommandStatus } from '@prisma/client';

type ContextoQueue = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, contexto: ContextoQueue) {
    const { id } = await contexto.params;

    try {
        const commandId = Number(id);

        const command = await prisma.command.findUnique({
            where: { id: commandId },
        });

        if (!command) {
            return NextResponse.json({ message: 'Command not found' }, { status: 404 });
        }

        if (command.status !== CommandStatus.PENDING) {
            return NextResponse.json({ message: 'Cannot cancel a command that is not pending' }, { status: 400 });
        }

        await prisma.command.delete({
            where: { id: commandId },
        });

        return NextResponse.json({ message: 'Command canceled successfully' }, { status: 200 });
    } catch (error) {
        console.error(`[API /queue/${id}] Error:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}
