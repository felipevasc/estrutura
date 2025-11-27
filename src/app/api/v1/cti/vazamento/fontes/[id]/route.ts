import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/database';
import { FonteVazamentoTipo } from '@prisma/client';

const camposObrigatorios: Record<FonteVazamentoTipo, string[]> = {
    TELEGRAM: ['canalOuGrupo', 'idGrupo', 'estrategiaDownload', 'intervaloMinutos', 'limiteArquivos', 'metodoAutenticacao'],
    FORUM_SURFACE: ['url', 'frequenciaMinutos'],
    FORUM_DARKWEB: ['endereco', 'proxy', 'frequenciaMinutos'],
};

const tiposValidos = Object.keys(camposObrigatorios) as FonteVazamentoTipo[];

const validarParametros = (tipo: FonteVazamentoTipo, parametros: Record<string, unknown>) => {
    if (tipo === FonteVazamentoTipo.TELEGRAM) {
        const metodo = parametros.metodoAutenticacao === 'BOT' ? 'BOT' : 'SESSAO';
        const basicos = camposObrigatorios[tipo];
        const especificos = metodo === 'BOT' ? ['tokenBot'] : ['nomeSessao'];
        const faltando = [...basicos, ...especificos].filter((campo) => !parametros[campo]);
        return faltando;
    }
    const faltando = camposObrigatorios[tipo].filter((campo) => !parametros[campo]);
    return faltando;
};

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) {
        return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    }

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

        const fonte = await prisma.fonteVazamento.update({
            where: { id },
            data: {
                nome,
                tipo,
                parametros,
                observacoes,
                projetoId: projetoId ? parseInt(`${projetoId}`, 10) : undefined,
            },
        });

        return NextResponse.json(fonte);
    } catch {
        return NextResponse.json({ error: 'Erro ao atualizar fonte' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) {
        return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    }

    try {
        await prisma.fonteVazamento.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Erro ao remover fonte' }, { status: 500 });
    }
}
