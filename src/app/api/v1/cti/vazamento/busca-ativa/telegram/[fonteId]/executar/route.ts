import { NextResponse } from 'next/server';
import prisma from '@/database';
import NanoSystem from '@/service/nano/System';
import { FonteVazamentoTipo } from '@prisma/client';

const comando = 'busca_ativa_vazamento_telegram';

export async function POST(_request: Request, { params }: { params: { fonteId: string } }) {
    const fonteId = parseInt(params.fonteId, 10);
    if (Number.isNaN(fonteId)) return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });

    try {
        const fonte = await prisma.fonteVazamento.findUnique({
            where: { id: fonteId },
            include: { buscaAtiva: true },
        });

        if (!fonte || fonte.tipo !== FonteVazamentoTipo.TELEGRAM)
            return NextResponse.json({ error: 'Fonte de Telegram não localizada' }, { status: 404 });
        if (!fonte.projetoId) return NextResponse.json({ error: 'Fonte deve estar vinculada a um projeto' }, { status: 400 });
        if (!fonte.buscaAtiva)
            return NextResponse.json({ error: 'Configure extensões e última captura antes de executar' }, { status: 400 });

        const command = await prisma.command.create({
            data: {
                command: comando,
                args: JSON.stringify({
                    fonteId,
                    extensoes: fonte.buscaAtiva.extensoes,
                    ultimaCapturaSucesso: fonte.buscaAtiva.ultimaCapturaSucesso,
                    destinoCentral: fonte.buscaAtiva.destinoCentral,
                    parametrosFonte: fonte.parametros,
                    projetoId: fonte.projetoId,
                }),
                projectId: fonte.projetoId,
            },
        });

        NanoSystem.process();

        return NextResponse.json({ commandId: command.id });
    } catch {
        return NextResponse.json({ error: 'Erro ao orquestrar coleta no Telegram' }, { status: 500 });
    }
}
