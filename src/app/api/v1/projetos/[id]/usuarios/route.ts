import { NextResponse } from 'next/server';
import prisma from '@/database';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt(params.id, 10);
        if (isNaN(projetoId)) {
            return NextResponse.json({ message: 'Invalid project ID' }, { status: 400 });
        }

        const usuarios = await prisma.usuario.findMany({
            where: {
                projetoId: projetoId,
            },
        });

        return NextResponse.json(usuarios, { status: 200 });
    } catch (error) {
        console.error('[API /projetos/:id/usuarios] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}
