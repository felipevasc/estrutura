import { NextResponse } from 'next/server';
import prisma from '@/database';
import NanoSystem from '@/service/nano/System';
import { CommandStatus, FonteVazamentoTipo } from '@prisma/client';

const comando = 'busca_ativa_vazamento_telegram_teste';

const credenciaisTelegram = () => ({
    apiId: process.env.TELEGRAM_API_ID,
    apiHash: process.env.TELEGRAM_API_HASH,
    numero: process.env.TELEGRAM_NUMERO,
    codigoPais: process.env.TELEGRAM_CODIGO_PAIS,
    senha: process.env.TELEGRAM_SENHA,
    sessao: process.env.TELEGRAM_SESSAO,
});

const esperarResultado = async (commandId: number) => {
    const limite = 25;
    for (let tentativa = 0; tentativa < limite; tentativa += 1) {
        const comandoAtual = await prisma.command.findUnique({ where: { id: commandId } });
        if (!comandoAtual) return null;
        if (comandoAtual.status === CommandStatus.COMPLETED || comandoAtual.status === CommandStatus.FAILED) {
            let resultado: unknown = comandoAtual.output;
            try {
                resultado = comandoAtual.output ? JSON.parse(comandoAtual.output) : null;
            } catch {
                resultado = comandoAtual.output;
            }
            return { status: comandoAtual.status, resultado };
        }
        await new Promise((resolver) => setTimeout(resolver, 200));
    }
    return null;
};

export async function POST(request: Request, contexto: { params: Promise<{ fonteId: string }> }) {
    const { fonteId: parametroFonteId } = await contexto.params;
    const fonteId = parseInt(parametroFonteId, 10);
    if (Number.isNaN(fonteId)) return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    const url = new URL(request.url);
    const etapaBruta = url.searchParams.get('etapa');
    const etapaTeste = etapaBruta === 'conexao' || etapaBruta === 'leitura' || etapaBruta === 'download' ? etapaBruta : undefined;

    try {
        const fonte = await prisma.fonteVazamento.findUnique({
            where: { id: fonteId },
            include: { buscaAtiva: true },
        });

        if (!fonte || fonte.tipo !== FonteVazamentoTipo.TELEGRAM)
            return NextResponse.json({ error: 'Fonte de Telegram não localizada' }, { status: 404 });
        if (!fonte.projetoId) return NextResponse.json({ error: 'Fonte deve estar vinculada a um projeto' }, { status: 400 });
        if (!fonte.buscaAtiva)
            return NextResponse.json({ error: 'Configure extensões e última captura antes de testar' }, { status: 400 });
        if (!Array.isArray(fonte.buscaAtiva.extensoes) || fonte.buscaAtiva.extensoes.length === 0)
            return NextResponse.json({ error: 'Defina extensões permitidas para o teste' }, { status: 400 });
        if (!fonte.buscaAtiva.destinoCentral)
            return NextResponse.json({ error: 'Informe o destino centralizado para o teste' }, { status: 400 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parametros = (fonte.parametros as any) || {};
        const metodoAutenticacao = parametros.metodoAutenticacao === 'BOT' ? 'BOT' : 'SESSAO';
        const credenciais = credenciaisTelegram();
        if (metodoAutenticacao === 'SESSAO' && (!credenciais.apiId || !credenciais.apiHash || !credenciais.sessao))
            return NextResponse.json({ error: 'Configure sessão, API ID e API Hash do Telegram' }, { status: 400 });
        if (metodoAutenticacao === 'BOT' && !parametros.tokenBot)
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
                    tokenBot: parametros.tokenBot,
                    nomeSessao: parametros.nomeSessao,
                    registroBusca: fonte.buscaAtiva,
                    etapaTeste,
                }),
                projectId: fonte.projetoId,
            },
        });

        NanoSystem.process();

        const retorno = await esperarResultado(command.id);
        if (retorno) return NextResponse.json(retorno);

        return NextResponse.json({ status: 'PENDENTE', commandId: command.id });
    } catch {
        return NextResponse.json({ error: 'Erro ao testar coleta no Telegram' }, { status: 500 });
    }
}
