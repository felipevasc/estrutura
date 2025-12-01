import { mkdir } from 'fs/promises';
import dayjs from 'dayjs';
import TelegramBot from 'node-telegram-bot-api';
import { EtapaTesteTelegram } from './ClienteTelegramSessao';

type CredenciaisBot = { tokenBot?: string };

type DadosExecucao = {
    alvo: string;
    extensoes: string[];
    destinoCentral?: string | null;
    ultimaCapturaSucesso?: string | null;
    parametrosFonte?: Record<string, unknown>;
    tokenBot?: string;
    etapaTeste?: EtapaTesteTelegram;
};

type PassoFluxo = {
    etapa: string;
    sucesso: boolean;
    enviado?: Record<string, unknown>;
    recebido?: Record<string, unknown>;
    detalhes?: string;
    duracaoMs?: number;
};

const mascarar = (valor?: string | null) => {
    if (!valor) return '';
    if (valor.length <= 6) return `${valor[0]}***${valor[valor.length - 1]}`;
    return `${valor.slice(0, 4)}***${valor.slice(-3)}`;
};

const validarCredenciais = (credenciais: CredenciaisBot) => {
    if (!credenciais.tokenBot) throw new Error('Bot do Telegram não configurado');
};

const registrarPasso = (
    etapa: string,
    enviado: Record<string, unknown>,
    recebido: Record<string, unknown>,
    detalhes?: string,
    duracaoMs?: number,
): PassoFluxo => ({ etapa, sucesso: true, enviado, recebido, detalhes, duracaoMs });

const registrarFalha = (etapa: string, detalhes: string, enviado: Record<string, unknown>): PassoFluxo => ({
    etapa,
    sucesso: false,
    enviado,
    recebido: {},
    detalhes,
    duracaoMs: 0,
});

const obterDestino = (parametros?: Record<string, unknown>) => {
    const idGrupo = parametros?.idGrupo as number | string | undefined;
    const canal = parametros?.canalOuGrupo as string | undefined;
    if (idGrupo) return idGrupo;
    if (canal) return canal;
    throw new Error('Informe o grupo ou canal do Telegram');
};

const lerAtualizacoes = async (bot: TelegramBot, parametros?: Record<string, unknown>, referencia?: string | null) => {
    const destino = obterDestino(parametros);
    const updates = await bot.getUpdates({ allowed_updates: ['message', 'channel_post'] });
    const mensagens = updates
        .map((atualizacao) => atualizacao.message || atualizacao.channel_post)
        .filter((msg) => msg && (msg.chat.id === Number(destino) || msg.chat.username === destino || msg.chat.title === destino))
        .map((msg) => ({
            id: msg?.message_id,
            texto: msg?.text || msg?.caption,
            data: msg?.date ? dayjs(msg.date * 1000).toISOString() : undefined,
            possuiArquivo: Boolean(msg?.document),
        }));
    return { destino, mensagens, referencia };
};

const baixarArquivos = async (
    bot: TelegramBot,
    parametros?: Record<string, unknown>,
    extensoes?: string[],
    destinoCentral?: string | null,
) => {
    const destino = obterDestino(parametros);
    if (!destinoCentral) throw new Error('Destino centralizado não definido');
    await mkdir(destinoCentral, { recursive: true });
    const updates = await bot.getUpdates({ allowed_updates: ['message', 'channel_post'] });
    const permitidas = (extensoes || []).map((item) => item.toLowerCase());
    const arquivos: { nome: string; caminho: string }[] = [];
    for (const atualizacao of updates) {
        const mensagem = atualizacao.message || atualizacao.channel_post;
        if (!mensagem) continue;
        if (!(mensagem.chat.id === Number(destino) || mensagem.chat.username === destino || mensagem.chat.title === destino))
            continue;
        const documento = mensagem.document;
        if (!documento) continue;
        const nome = documento.file_name;
        if (!nome) continue;
        const extensao = nome.split('.').pop()?.toLowerCase();
        if (!extensao || !permitidas.includes(extensao)) continue;
        const caminho = await bot.downloadFile(documento.file_id, destinoCentral);
        arquivos.push({ nome, caminho });
    }
    return { destino, arquivos };
};

export type ResultadoFluxoTelegram = {
    alvo: string;
    sucesso: boolean;
    passos: PassoFluxo[];
};

export const clienteTelegramBot = {
    descricao: 'Consome mensagens via bot HTTP e baixa arquivos filtrando extensões.',
    async executar(payload: DadosExecucao): Promise<ResultadoFluxoTelegram> {
        validarCredenciais({ tokenBot: payload.tokenBot });
        const bot = new TelegramBot(payload.tokenBot as string, { polling: false });
        const inicioConexao = Date.now();
        const me = await bot.getMe();
        const passoConexao = registrarPasso(
            'Conexão do bot',
            { token: mascarar(payload.tokenBot) },
            { id: me.id, nome: me.first_name },
            undefined,
            Date.now() - inicioConexao,
        );
        const inicioLeitura = Date.now();
        const leitura = await lerAtualizacoes(bot, payload.parametrosFonte, payload.ultimaCapturaSucesso);
        const passoLeitura = registrarPasso(
            'Coleta de mensagens',
            { destino: leitura.destino, referencia: payload.ultimaCapturaSucesso },
            { mensagens: leitura.mensagens },
            undefined,
            Date.now() - inicioLeitura,
        );
        const inicioDownload = Date.now();
        const download = await baixarArquivos(bot, payload.parametrosFonte, payload.extensoes, payload.destinoCentral);
        const passoDownload = registrarPasso(
            'Download de arquivos',
            { extensoes: payload.extensoes, destinoCentral: payload.destinoCentral },
            { destino: download.destino, quantidade: download.arquivos.length, arquivos: download.arquivos },
            'Arquivos baixados com bot HTTP',
            Date.now() - inicioDownload,
        );
        return { alvo: payload.alvo, sucesso: true, passos: [passoConexao, passoLeitura, passoDownload] };
    },
    async testar(payload: DadosExecucao): Promise<ResultadoFluxoTelegram> {
        try {
            validarCredenciais({ tokenBot: payload.tokenBot });
            const bot = new TelegramBot(payload.tokenBot as string, { polling: false });
            const inicioConexao = Date.now();
            const me = await bot.getMe();
            const passos: PassoFluxo[] = [];
            const passoConexao = registrarPasso(
                'Conexão do bot',
                { token: mascarar(payload.tokenBot) },
                { id: me.id, nome: me.first_name },
                undefined,
                Date.now() - inicioConexao,
            );
            passos.push(passoConexao);
            if (payload.etapaTeste === 'conexao') return { alvo: payload.alvo, sucesso: passoConexao.sucesso, passos };
            const inicioLeitura = Date.now();
            const leitura = await lerAtualizacoes(bot, payload.parametrosFonte, payload.ultimaCapturaSucesso);
            const passoLeitura = registrarPasso(
                'Coleta de mensagens',
                { destino: leitura.destino, referencia: payload.ultimaCapturaSucesso },
                { mensagens: leitura.mensagens },
                undefined,
                Date.now() - inicioLeitura,
            );
            passos.push(passoLeitura);
            if (payload.etapaTeste === 'leitura') return { alvo: payload.alvo, sucesso: passos.every((item) => item.sucesso), passos };
            const inicioDownload = Date.now();
            const download = await baixarArquivos(bot, payload.parametrosFonte, payload.extensoes, payload.destinoCentral);
            const passoDownload = registrarPasso(
                'Download de arquivos',
                { extensoes: payload.extensoes, destinoCentral: payload.destinoCentral },
                { destino: download.destino, quantidade: download.arquivos.length, arquivos: download.arquivos },
                'Arquivos baixados com bot HTTP',
                Date.now() - inicioDownload,
            );
            passos.push(passoDownload);
            return { alvo: payload.alvo, sucesso: passos.every((item) => item.sucesso), passos };
        } catch (erro) {
            const enviado = { token: mascarar(payload.tokenBot), destinoCentral: payload.destinoCentral };
            if (erro instanceof Error) return { alvo: payload.alvo, sucesso: false, passos: [registrarFalha('Fluxo do bot', erro.message, enviado)] };
            return { alvo: payload.alvo, sucesso: false, passos: [registrarFalha('Fluxo do bot', 'Falha desconhecida', enviado)] };
        }
    },
};
