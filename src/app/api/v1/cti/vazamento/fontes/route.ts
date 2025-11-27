import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/database';
import { FonteVazamentoTipo } from '@prisma/client';

const camposObrigatorios: Record<FonteVazamentoTipo, string[]> = {
    TELEGRAM: ['tokenBot', 'canalOuGrupo', 'idGrupo', 'estrategiaDownload', 'intervaloMinutos', 'limiteArquivos'],
    FORUM_SURFACE: ['url', 'frequenciaMinutos'],
    FORUM_DARKWEB: ['endereco', 'proxy', 'frequenciaMinutos'],
};

const tiposValidos = Object.keys(camposObrigatorios) as FonteVazamentoTipo[];

const validarParametros = (tipo: FonteVazamentoTipo, parametros: Record<string, unknown>) => {
    const faltando = camposObrigatorios[tipo].filter((campo) => !parametros[campo]);
    return faltando;
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const projetoId = searchParams.get('projetoId');
    const tipo = searchParams.get('tipo');

    const where: { projetoId?: number; tipo?: FonteVazamentoTipo } = {};
    if (projetoId) where.projetoId = parseInt(projetoId, 10);
    if (tipo && tiposValidos.includes(tipo as FonteVazamentoTipo)) where.tipo = tipo as FonteVazamentoTipo;

    try {
        const fontes = await prisma.fonteVazamento.findMany({
            where,
            orderBy: { criadoEm: 'desc' },
        });
        return NextResponse.json(fontes);
    } catch {
        return NextResponse.json({ error: 'Erro ao listar fontes' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { nome, tipo, parametros, observacoes, projetoId } = await request.json();
        if (!nome || !tipo || !parametros) {
            return NextResponse.json({ error: 'Nome, tipo e parâmetros são obrigatórios' }, { status: 400 });
        }

        if (!tiposValidos.includes(tipo)) {
            return NextResponse.json({ error: 'Tipo de fonte inválido' }, { status: 400 });
        }

        const faltando = validarParametros(tipo, parametros);
        if (faltando.length > 0) {
            return NextResponse.json({ error: `Campos obrigatórios ausentes: ${faltando.join(', ')}` }, { status: 400 });
        }

        const fonte = await prisma.fonteVazamento.create({
            data: {
                nome,
                tipo,
                parametros,
                observacoes,
                projetoId: projetoId ? parseInt(`${projetoId}`, 10) : undefined,
            },
        });

        return NextResponse.json(fonte, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Erro ao criar fonte' }, { status: 500 });
    }
}
