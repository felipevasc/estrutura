import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/database';
import { FonteVazamentoTipo } from '@prisma/client';

const validarExtensoes = (valor: unknown) => {
    if (!Array.isArray(valor)) return [] as string[];
    const lista = valor
        .map((item) => `${item}`.trim().toLowerCase())
        .filter((item) => item);
    return Array.from(new Set(lista));
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const projetoIdBruto = searchParams.get('projetoId');
    const projetoId = projetoIdBruto ? parseInt(`${projetoIdBruto}`, 10) : undefined;
    if (projetoIdBruto && Number.isNaN(projetoId))
        return NextResponse.json({ error: 'Projeto inválido' }, { status: 400 });

    const where = projetoId
        ? { fonte: { projetoId, tipo: FonteVazamentoTipo.TELEGRAM } }
        : { fonte: { tipo: FonteVazamentoTipo.TELEGRAM } };

    try {
        const registros = await prisma.buscaAtivaTelegram.findMany({
            where,
            include: { fonte: true },
            orderBy: { atualizadoEm: 'desc' },
        });
        return NextResponse.json(registros);
    } catch {
        return NextResponse.json({ error: 'Erro ao listar buscas ativas de Telegram' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { fonteId, extensoes, ultimaCapturaSucesso, destinoCentral } = await request.json();
        if (!fonteId) return NextResponse.json({ error: 'Fonte obrigatória' }, { status: 400 });

        const extensoesValidadas = validarExtensoes(extensoes);
        if (extensoesValidadas.length === 0)
            return NextResponse.json({ error: 'Informe pelo menos uma extensão' }, { status: 400 });

        let dataCaptura: Date | undefined;
        if (ultimaCapturaSucesso) {
            const data = new Date(ultimaCapturaSucesso);
            if (Number.isNaN(data.getTime()))
                return NextResponse.json({ error: 'Data inválida' }, { status: 400 });
            dataCaptura = data;
        }

        const fonte = await prisma.fonteVazamento.findUnique({ where: { id: fonteId } });
        if (!fonte || fonte.tipo !== FonteVazamentoTipo.TELEGRAM)
            return NextResponse.json({ error: 'Fonte de Telegram não localizada' }, { status: 404 });

        const registro = await prisma.buscaAtivaTelegram.upsert({
            where: { fonteId },
            update: {
                extensoes: extensoesValidadas,
                ultimaCapturaSucesso: dataCaptura,
                destinoCentral,
            },
            create: {
                fonteId,
                extensoes: extensoesValidadas,
                ultimaCapturaSucesso: dataCaptura,
                destinoCentral,
            },
        });

        return NextResponse.json(registro);
    } catch {
        return NextResponse.json({ error: 'Erro ao salvar parâmetros de Telegram' }, { status: 500 });
    }
}
