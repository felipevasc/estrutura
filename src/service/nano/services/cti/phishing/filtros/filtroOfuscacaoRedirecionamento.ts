import { RetornoFiltro, ResultadoFiltro } from './tipos';

const padroes = [
    /http-equiv=['"]refresh['"]/,
    /window\.location\s*=\s*['"]/,
    /location\.replace\(/,
    /atob\(/,
    /eval\(/,
    /fromcharcode\(/,
    /[a-z0-9+/]{120,}=*/
];

const filtroOfuscacaoRedirecionamento = (html: string): RetornoFiltro => {
    const base = (html || '').toLowerCase();
    const correspondencias = padroes.filter((padrao) => padrao.test(base));
    if (correspondencias.length >= 2) return { resultado: ResultadoFiltro.Possivel, detalhe: 'ofuscacao_redirecionamento' };
    return { resultado: ResultadoFiltro.Prosseguir };
};

export default filtroOfuscacaoRedirecionamento;
