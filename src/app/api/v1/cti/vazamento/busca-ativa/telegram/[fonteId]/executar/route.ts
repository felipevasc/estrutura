import { NextResponse } from 'next/server';
import prisma from '@/database';
import NanoSystem from '@/service/nano/System';
import { FonteVazamentoTipo } from '@prisma/client';

const comando = 'busca_ativa_vazamento_telegram';

const credenciaisTelegram = () => ({
    apiId: process.env.TELEGRAM_API_ID,
    apiHash: process.env.TELEGRAM_API_HASH,
    numero: process.env.TELEGRAM_NUMERO,
    codigoPais: process.env.TELEGRAM_CODIGO_PAIS,
    senha: process.env.TELEGRAM_SENHA,
    sessao: process.env.TELEGRAM_SESSAO,
});

export async function POST(_request: Request, contexto: { params: { fonteId: string } }) {
    const { fonteId: parametroFonteId } = contexto.params;
    const fonteId = parseInt(parametroFonteId, 10);
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
            return NextResponse.json({ error: 'Configure extensões, destino e última captura antes de executar' }, { status: 400 });
        if (!Array.isArray(fonte.buscaAtiva.extensoes) || fonte.buscaAtiva.extensoes.length === 0)
            return NextResponse.json({ error: 'Defina extensões permitidas para executar' }, { status: 400 });
        if (!fonte.buscaAtiva.destinoCentral)
            return NextResponse.json({ error: 'Informe o destino centralizado para a coleta' }, { status: 400 });

        const metodoAutenticacao = fonte.parametros?.metodoAutenticacao === 'BOT' ? 'BOT' : 'SESSAO';
        const credenciais = credenciaisTelegram();
        if (metodoAutenticacao === 'SESSAO' && (!credenciais.apiId || !credenciais.apiHash || !credenciais.sessao))
            return NextResponse.json({ error: 'Configure sessão, API ID e API Hash do Telegram' }, { status: 400 });
        if (metodoAutenticacao === 'BOT' && !fonte.parametros?.tokenBot)
            return NextResponse.json({ error: 'Informe o token do bot do Telegram' }, { status: 400 });

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
                    metodoAutenticacao,
                    credenciais,
                    tokenBot: fonte.parametros?.tokenBot,
                    nomeSessao: fonte.parametros?.nomeSessao,
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
