import { RetornoFiltro, ResultadoFiltro } from './tipos';

const filtroEstruturaVazia = (html: string): RetornoFiltro => {
    const texto = (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, '').trim();
    if (!texto) return { resultado: ResultadoFiltro.Descartar, detalhe: 'pagina_vazia' };
    return { resultado: ResultadoFiltro.Prosseguir };
};

export default filtroEstruturaVazia;
