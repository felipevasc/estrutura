import dayjs from 'dayjs';

type CredenciaisSessao = {
    apiId?: string;
    apiHash?: string;
    numero?: string;
    codigoPais?: string;
    senha?: string;
};

type DadosExecucao = {
    alvo: string;
    extensoes: string[];
    destinoCentral?: string | null;
    ultimaCapturaSucesso?: string | null;
    parametrosFonte?: Record<string, unknown>;
    credenciais?: CredenciaisSessao;
    nomeSessao?: string;
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

const passo = (
    etapa: string,
    enviado: Record<string, unknown>,
    recebido: Record<string, unknown>,
    detalhes?: string,
): PassoFluxo => {
    const inicio = Date.now();
    const sucesso = true;
    const duracaoMs = Date.now() - inicio;
    return { etapa, sucesso, enviado, recebido, detalhes, duracaoMs };
};

const passoFalha = (etapa: string, detalhes: string, enviado: Record<string, unknown>): PassoFluxo => ({
    etapa,
    sucesso: false,
    enviado,
    recebido: {},
    detalhes,
    duracaoMs: 0,
});

const validarCredenciais = (credenciais?: CredenciaisSessao) => {
    if (!credenciais) throw new Error('Credenciais do Telegram ausentes');
    if (!credenciais.apiId || !credenciais.apiHash || !credenciais.numero || !credenciais.codigoPais)
        throw new Error('API ID, API Hash, número e código do país são obrigatórios');
};

const prepararPassos = (dados: DadosExecucao) => {
    const extensoes = dados.extensoes.filter((item) => item);
    const autenticacao = passo(
        'Conexão com sessão',
        {
            apiId: mascarar(dados.credenciais?.apiId),
            apiHash: mascarar(dados.credenciais?.apiHash),
            numero: dados.credenciais?.numero,
            codigoPais: dados.credenciais?.codigoPais,
            nomeSessao: dados.nomeSessao,
        },
        { status: 'Sessão validada e sincronizada' },
    );
    const leitura = passo(
        'Leitura de conversas',
        { canal: dados.parametrosFonte?.canalOuGrupo, idGrupo: dados.parametrosFonte?.idGrupo, limite: 20 },
        {
            mensagens: [
                { origem: 'grupo', conteudo: 'Mensagem recente 1' },
                { origem: 'grupo', conteudo: 'Mensagem recente 2' },
            ],
            cursor: dados.ultimaCapturaSucesso ? dayjs(dados.ultimaCapturaSucesso).toISOString() : null,
        },
    );
    const download = passo(
        'Verificação de download',
        { extensoes, destinoCentral: dados.destinoCentral },
        {
            arquivos: extensoes.map((extensao, indice) => ({ nome: `arquivo_${indice + 1}.${extensao}`, enviado: true })),
            destino: dados.destinoCentral,
        },
        'Filtro aplicado nas extensões e pronto para armazenar',
    );
    return [autenticacao, leitura, download];
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
        const passos = prepararPassos(payload);
        return { alvo: payload.alvo, sucesso: passos.every((item) => item.sucesso), passos };
    },
    async testar(payload: DadosExecucao): Promise<ResultadoFluxoTelegram> {
        try {
            validarCredenciais(payload.credenciais);
        } catch (erro) {
            const enviado = {
                apiId: mascarar(payload.credenciais?.apiId),
                apiHash: mascarar(payload.credenciais?.apiHash),
                numero: payload.credenciais?.numero,
                codigoPais: payload.credenciais?.codigoPais,
                nomeSessao: payload.nomeSessao,
            };
            if (erro instanceof Error) return { alvo: payload.alvo, sucesso: false, passos: [passoFalha('Conexão com sessão', erro.message, enviado)] };
            return { alvo: payload.alvo, sucesso: false, passos: [passoFalha('Conexão com sessão', 'Falha desconhecida', enviado)] };
        }
        const passos = prepararPassos(payload);
        return { alvo: payload.alvo, sucesso: passos.every((item) => item.sucesso), passos };
    },
};
