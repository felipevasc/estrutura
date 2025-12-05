import { NextResponse } from 'next/server';
import prisma from '@/database';
import { CommandStatus } from '@prisma/client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const limite = Number(searchParams.get('limite') || 20);
    const inicio = Number(searchParams.get('inicio') || 0);

    const listaStatus = status?.split(',').filter(Boolean) as CommandStatus[] | undefined;

    const filtroStatus = listaStatus?.length ? { status: { in: listaStatus } } : {};
    const filtroProjeto = projectId ? { projectId: Number(projectId) } : {};
    const filtro = { ...filtroProjeto, ...filtroStatus };

    try {
        const total = await prisma.command.count({ where: filtro });

        const registros = await prisma.command.findMany({
            where: filtro,
            orderBy: {
                createdAt: 'desc',
            },
            skip: inicio,
            take: limite,
        });

        return NextResponse.json({ total, registros }, { status: 200 });
    } catch (error) {
        console.error('[API /queue] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}
