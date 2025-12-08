import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import dayjs from 'dayjs';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

export type EtapaTesteTelegram = 'conexao' | 'leitura' | 'download';

type CredenciaisSessao = {
    apiId?: string;
    apiHash?: string;
    numero?: string;
    codigoPais?: string;
    senha?: string;
    sessao?: string;
};

type DadosExecucao = {
    alvo: string;
    extensoes: string[];
    destinoCentral?: string | null;
    ultimaCapturaSucesso?: string | null;
    parametrosFonte?: Record<string, unknown>;
    credenciais?: CredenciaisSessao;
    nomeSessao?: string;
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

const validarCredenciais = (credenciais?: CredenciaisSessao) => {
    if (!credenciais) throw new Error('Credenciais do Telegram ausentes');
    if (!credenciais.apiId || !credenciais.apiHash || !credenciais.sessao)
        throw new Error('Sessão, API ID e API Hash são obrigatórios');
};

const prepararCliente = async (credenciais: CredenciaisSessao) => {
    const apiIdNumero = Number(credenciais.apiId);
    if (Number.isNaN(apiIdNumero)) throw new Error('API ID inválido');
    const cliente = new TelegramClient(new StringSession(credenciais.sessao || ''), apiIdNumero, credenciais.apiHash || '', {
        connectionRetries: 3,
    });
    await cliente.connect();
    if (!cliente.connected) throw new Error('Conexão com o Telegram falhou');
    const usuario = await cliente.getMe();
    const sessao = String(cliente.session.save());
    const caminho = join(process.cwd(), 'tmp', 'sessoes-telegram');
    await mkdir(caminho, { recursive: true });
    const nomeArquivo = join(caminho, `${credenciais.numero || credenciais.codigoPais || 'conta'}.session`);
    await writeFile(nomeArquivo, sessao);
    return { cliente, usuario, sessaoSalva: sessao };
};

const obterDestino = (parametros?: Record<string, unknown>) => {
    const idGrupo = parametros?.idGrupo as string | number | undefined;
    const canal = parametros?.canalOuGrupo as string | undefined;
    if (idGrupo) return idGrupo;
    if (canal) return canal;
    throw new Error('Informe o grupo ou canal do Telegram');
};

const lerMensagens = async (cliente: TelegramClient, parametros?: Record<string, unknown>, referencia?: string | null) => {
    const destino = obterDestino(parametros);
    const mensagens = await cliente.getMessages(destino as any, { limit: 15 });
    const filtradas = mensagens.map((mensagem) => ({
        id: mensagem.id,
        texto: mensagem.message,
        data:
            typeof mensagem.date === 'object' && (mensagem.date as any) instanceof Date
                ? dayjs(mensagem.date).toISOString()
                : typeof mensagem.date === 'number'
                  ? dayjs(mensagem.date * 1000).toISOString()
                  : undefined,
        possuiArquivo: Boolean(mensagem.document),
    }));
    const desde = referencia ? dayjs(referencia).toISOString() : null;
    return { destino, mensagens: filtradas, desde };
};

const baixarArquivos = async (
    cliente: TelegramClient,
    mensagens: any[],
    extensoes: string[],
    destinoCentral?: string | null,
) => {
    if (!destinoCentral) throw new Error('Destino centralizado não definido');
    await mkdir(destinoCentral, { recursive: true });
    const arquivos: { nome: string; caminho: string }[] = [];
    const permitidas = extensoes.map((item) => item.toLowerCase());
    for (const mensagem of mensagens) {
        const documento = mensagem.document as { mimeType?: string; attributes?: { fileName?: string }[] } | undefined;
        if (!documento) continue;
        const atributoNome = documento.attributes?.find((item) => 'fileName' in item && (item as any).fileName);
        const nome = (atributoNome as any)?.fileName as string | undefined;
        if (!nome) continue;
        const extensao = nome.split('.').pop()?.toLowerCase();
        if (!extensao || !permitidas.includes(extensao)) continue;
        const caminhoArquivo = join(destinoCentral, nome);
        await cliente.downloadMedia(mensagem, { outputFile: caminhoArquivo });
        arquivos.push({ nome, caminho: caminhoArquivo });
    }
    return arquivos;
};

export type ResultadoFluxoTelegram = {
    alvo: string;
    sucesso: boolean;
    passos: PassoFluxo[];
};

export const clienteTelegramSessao = {
    descricao: 'Autentica com sessão de usuário e baixa arquivos filtrando extensões.',
    async executar(payload: DadosExecucao): Promise<ResultadoFluxoTelegram> {
        validarCredenciais(payload.credenciais);
        const inicio = Date.now();
        const inicioConexao = Date.now();
        const { cliente, usuario } = await prepararCliente(payload.credenciais as CredenciaisSessao);
        const passoConexao = registrarPasso(
            'Conexão com sessão',
            {
                apiId: mascarar(payload.credenciais?.apiId),
                apiHash: mascarar(payload.credenciais?.apiHash),
                numero: payload.credenciais?.numero,
                codigoPais: payload.credenciais?.codigoPais,
                nomeSessao: payload.nomeSessao,
            },
            { id: usuario?.id, nome: (usuario as any)?.firstName, telefone: (usuario as any)?.phone },
            undefined,
            Date.now() - inicioConexao,
        );
        const inicioLeitura = Date.now();
        const leitura = await lerMensagens(cliente, payload.parametrosFonte, payload.ultimaCapturaSucesso);
        const passoLeitura = registrarPasso(
            'Leitura de conversas',
            { destino: leitura.destino, limite: 15, referencia: payload.ultimaCapturaSucesso },
            { mensagens: leitura.mensagens },
            undefined,
            Date.now() - inicioLeitura,
        );
        const inicioDownload = Date.now();
        const arquivos = await baixarArquivos(
            cliente,
            await cliente.getMessages(leitura.destino as any, { limit: 30 }),
            payload.extensoes,
            payload.destinoCentral,
        );
        const passoDownload = registrarPasso(
            'Download de arquivos',
            { extensoes: payload.extensoes, destinoCentral: payload.destinoCentral },
            { quantidade: arquivos.length, arquivos },
            'Arquivos gravados com filtro de extensões',
            Date.now() - inicioDownload,
        );
        return { alvo: payload.alvo, sucesso: true, passos: [passoConexao, passoLeitura, passoDownload] };
    },
    async testar(payload: DadosExecucao): Promise<ResultadoFluxoTelegram> {
        try {
            validarCredenciais(payload.credenciais);
            const inicioConexao = Date.now();
            const { cliente, usuario } = await prepararCliente(payload.credenciais as CredenciaisSessao);
            const passos: PassoFluxo[] = [];
            const passoConexao = registrarPasso(
                'Conexão com sessão',
                {
                    apiId: mascarar(payload.credenciais?.apiId),
                    apiHash: mascarar(payload.credenciais?.apiHash),
                    numero: payload.credenciais?.numero,
                    codigoPais: payload.credenciais?.codigoPais,
                    nomeSessao: payload.nomeSessao,
                },
                { id: usuario?.id, nome: (usuario as any)?.firstName, telefone: (usuario as any)?.phone },
                undefined,
                Date.now() - inicioConexao,
            );
            passos.push(passoConexao);
            if (payload.etapaTeste === 'conexao') return { alvo: payload.alvo, sucesso: passoConexao.sucesso, passos };
            const inicioLeitura = Date.now();
            const leitura = await lerMensagens(cliente, payload.parametrosFonte, payload.ultimaCapturaSucesso);
            const passoLeitura = registrarPasso(
                'Leitura de conversas',
                { destino: leitura.destino, limite: 15, referencia: payload.ultimaCapturaSucesso },
                { mensagens: leitura.mensagens },
                undefined,
                Date.now() - inicioLeitura,
            );
            passos.push(passoLeitura);
            if (payload.etapaTeste === 'leitura')
                return { alvo: payload.alvo, sucesso: passos.every((item) => item.sucesso), passos };
            const inicioDownload = Date.now();
            const mensagens = await cliente.getMessages(leitura.destino as any, { limit: 30 });
            const arquivos = await baixarArquivos(cliente, mensagens, payload.extensoes, payload.destinoCentral);
            const passoDownload = registrarPasso(
                'Download de arquivos',
                { extensoes: payload.extensoes, destinoCentral: payload.destinoCentral },
                { quantidade: arquivos.length, arquivos },
                'Arquivos gravados com filtro de extensões',
                Date.now() - inicioDownload,
            );
            passos.push(passoDownload);
            return { alvo: payload.alvo, sucesso: passos.every((item) => item.sucesso), passos };
        } catch (erro) {
            const enviado = {
                apiId: mascarar(payload.credenciais?.apiId),
                apiHash: mascarar(payload.credenciais?.apiHash),
                numero: payload.credenciais?.numero,
                codigoPais: payload.credenciais?.codigoPais,
                nomeSessao: payload.nomeSessao,
                destinoCentral: payload.destinoCentral,
            };
            if (erro instanceof Error) return { alvo: payload.alvo, sucesso: false, passos: [registrarFalha('Fluxo de sessão', erro.message, enviado)] };
            return { alvo: payload.alvo, sucesso: false, passos: [registrarFalha('Fluxo de sessão', 'Falha desconhecida', enviado)] };
        }
    },
};
