
import { NextResponse } from 'next/server';
import prisma from '@/database';

// GET /api/v1/cti/takedown/solicitantes
export async function GET() {
    try {
        const solicitantes = await prisma.takedownSolicitante.findMany({
            orderBy: {
                nome: 'asc'
            }
        });
        return NextResponse.json(solicitantes);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar solicitantes' }, { status: 500 });
    }
}
