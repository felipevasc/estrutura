import { RetornoFiltro, ResultadoFiltro } from './tipos';

const termos = [
    'verifique sua conta',
    'confirme sua identidade',
    'login seguro',
    'sua conta foi bloqueada',
    'atualize sua senha',
    'redefina sua senha',
    'access suspended',
    'update your password',
    'verify your account',
    'security check'
];

const filtroTermosAlerta = (html: string): RetornoFiltro => {
    const base = (html || '').toLowerCase();
    const termo = termos.find((entrada) => base.includes(entrada));
    if (termo) return { resultado: ResultadoFiltro.Possivel, detalhe: 'termos_alerta' };
    return { resultado: ResultadoFiltro.Prosseguir };
};

export default filtroTermosAlerta;
