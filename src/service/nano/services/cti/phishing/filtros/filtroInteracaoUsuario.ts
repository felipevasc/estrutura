import { RetornoFiltro, ResultadoFiltro } from './tipos';

const filtroInteracaoUsuario = (html: string): RetornoFiltro => {
    const base = (html || '').toLowerCase();
    const possuiInput = /<input\b|<textarea\b|<select\b/.test(base);
    const possuiAcao = /<button\b|type=['"]submit['"]|onclick=/.test(base);
    const possuiLink = /<a[^>]+href=/.test(base);
    if (!possuiInput && !possuiAcao && !possuiLink) return { resultado: ResultadoFiltro.Descartar, detalhe: 'sem_interacao' };
    return { resultado: ResultadoFiltro.Prosseguir };
};

export default filtroInteracaoUsuario;
