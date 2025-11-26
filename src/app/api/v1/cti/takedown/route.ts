
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/database';
import { queueCommand } from '@/service/nano/commandHelper';

// GET /api/v1/cti/takedown?projetoId=[id]
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const projetoId = searchParams.get('projetoId');

    if (!projetoId) {
        return NextResponse.json({ error: 'O ID do projeto é obrigatório' }, { status: 400 });
    }

    try {
        const takedowns = await prisma.takedown.findMany({
            where: {
                projetoId: parseInt(projetoId, 10),
            },
            include: {
                solicitantes: true,
            },
            orderBy: {
                solicitadoEm: 'desc',
            },
        });
        return NextResponse.json(takedowns);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar takedowns' }, { status: 500 });
    }
}

// POST /api/v1/cti/takedown
export async function POST(request: NextRequest) {
    try {
        const { url, solicitantes, projetoId } = await request.json();

        const errors = [];
        if (!url) errors.push('URL');
        if (!projetoId) errors.push('ID do Projeto');
        if (!solicitantes || !Array.isArray(solicitantes) || solicitantes.length === 0) {
            errors.push('Solicitado Para');
        }

        if (errors.length > 0) {
            const errorMessage = `Os seguintes campos são obrigatórios: ${errors.join(', ')}.`;
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        const commandName = 'criar_takedown';
        const args = { url, solicitantes, projetoId };

        await queueCommand(commandName, args, projetoId);

        return NextResponse.json({ message: `Comando '${commandName}' enfileirado com sucesso.` });
    } catch (error) {
        console.error("Erro ao criar takedown:", error);
        return NextResponse.json({ error: 'Erro ao criar takedown' }, { status: 500 });
    }
}
