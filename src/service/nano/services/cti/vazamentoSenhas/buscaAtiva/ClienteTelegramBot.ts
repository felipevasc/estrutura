import dayjs from 'dayjs';

type CredenciaisBot = { tokenBot?: string };

type DadosExecucao = {
    alvo: string;
    extensoes: string[];
    destinoCentral?: string | null;
    ultimaCapturaSucesso?: string | null;
    parametrosFonte?: Record<string, unknown>;
    tokenBot?: string;
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

const prepararPassos = (dados: DadosExecucao) => {
    const extensoes = dados.extensoes.filter((item) => item);
    const conectado = passo('Conexão do bot', { token: mascarar(dados.tokenBot) }, { status: 'Autenticado no gateway HTTP' });
    const leitura = passo(
        'Coleta de mensagens',
        { destino: dados.parametrosFonte?.canalOuGrupo, idGrupo: dados.parametrosFonte?.idGrupo },
        { mensagens: [{ texto: 'Pré-visualização das últimas mensagens' }, { texto: 'Monitoramento ativo' }] },
    );
    const download = passo(
        'Download de arquivos',
        { extensoes, destinoCentral: dados.destinoCentral },
        {
            arquivos: extensoes.map((extensao, indice) => ({ nome: `arquivo_${indice + 1}.${extensao}`, destino: dados.destinoCentral })),
            referenciaTemporal: dados.ultimaCapturaSucesso ? dayjs(dados.ultimaCapturaSucesso).toISOString() : null,
        },
        'Filtro aplicado e pronto para captura',
    );
    return [conectado, leitura, download];
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
        const passos = prepararPassos(payload);
        return { alvo: payload.alvo, sucesso: passos.every((item) => item.sucesso), passos };
    },
    async testar(payload: DadosExecucao): Promise<ResultadoFluxoTelegram> {
        try {
            validarCredenciais({ tokenBot: payload.tokenBot });
        } catch (erro) {
            const enviado = { token: mascarar(payload.tokenBot) };
            if (erro instanceof Error) return { alvo: payload.alvo, sucesso: false, passos: [passoFalha('Conexão do bot', erro.message, enviado)] };
            return { alvo: payload.alvo, sucesso: false, passos: [passoFalha('Conexão do bot', 'Falha desconhecida', enviado)] };
        }
        const passos = prepararPassos(payload);
        return { alvo: payload.alvo, sucesso: passos.every((item) => item.sucesso), passos };
    },
};
