import prisma from '@/database';

type Credenciais = {
    apiId?: string;
    apiHash?: string;
    numero?: string;
    codigoPais?: string;
    senha?: string;
};

type Parametros = {
    fonteId?: number;
    alvo?: string;
    extensoes?: string[];
    ultimaCapturaSucesso?: string | Date | null;
    destinoCentral?: string | null;
    credenciais?: Credenciais;
    nomeSessao?: string;
};

const normalizarData = (valor?: string | Date | null) => {
    if (!valor) return undefined;
    const data = typeof valor === 'string' ? new Date(valor) : valor;
    if (Number.isNaN(data.getTime())) throw new Error('Data de última captura inválida');
    return data;
};

const validar = ({ fonteId, extensoes, destinoCentral, credenciais }: Parametros) => {
    if (!fonteId) throw new Error('Fonte obrigatória');
    if (!destinoCentral) throw new Error('Defina o destino centralizado');
    if (!extensoes || extensoes.length === 0) throw new Error('Extensões obrigatórias');
    const { apiId, apiHash, numero, codigoPais, senha } = credenciais || {};
    if (!apiId || !apiHash || !numero || !codigoPais) throw new Error('Credenciais do Telegram ausentes');
    if (!senha) throw new Error('Senha ou token de sessão ausente');
};

export const clienteTelegramSessao = {
    descricao: 'Autentica com sessão de usuário e baixa arquivos filtrando extensões.',
    async executar(payload: Parametros) {
        validar(payload);
        const ultimaCaptura = normalizarData(payload.ultimaCapturaSucesso) || new Date();
        await prisma.buscaAtivaTelegram.update({ where: { fonteId: payload.fonteId as number }, data: { ultimaCapturaSucesso: ultimaCaptura } });
        return { fonteId: payload.fonteId, alvo: payload.alvo, extensoes: payload.extensoes, ultimaCapturaSucesso: ultimaCaptura, destinoCentral: payload.destinoCentral, nomeSessao: payload.nomeSessao };
    },
};
