
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/database';

type ContextoTakedown = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, contexto: ContextoTakedown) {
    const { id } = await contexto.params;
    try {
        const takedown = await prisma.takedown.findUnique({
            where: { id: parseInt(id, 10) },
            include: { solicitantes: true },
        });
        if (!takedown) {
            return NextResponse.json({ error: 'Takedown não encontrado' }, { status: 404 });
        }
        return NextResponse.json(takedown);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar takedown' }, { status: 500 });
    }
}


export async function PUT(request: NextRequest, contexto: ContextoTakedown) {
    const { id } = await contexto.params;
    try {
        const { url, solicitadoEm, previsao, derrubadoEm, status, metodoHttp, headers, body, solicitantes } = await request.json();

        const solicitantesConnectOrCreate = solicitantes?.map((nome: string) => ({
            where: { nome },
            create: { nome },
        }));

        const updatedTakedown = await prisma.takedown.update({
            where: { id: parseInt(id, 10) },
            data: {
                url,
                solicitadoEm,
                previsao,
                derrubadoEm,
                status,
                metodoHttp,
                headers,
                body,
                solicitantes: solicitantes ? {
                    set: [], // Disconecta todos os existentes primeiro
                    connectOrCreate: solicitantesConnectOrCreate,
                } : undefined,
            },
            include: {
                solicitantes: true,
            }
        });

        return NextResponse.json(updatedTakedown);
    } catch (error) {
        console.error("Erro ao atualizar takedown:", error);
        return NextResponse.json({ error: 'Erro ao atualizar takedown' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, contexto: ContextoTakedown) {
    const { id } = await contexto.params;
    try {
        await prisma.takedown.delete({
            where: { id: parseInt(id, 10) },
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao deletar takedown' }, { status: 500 });
    }
}
