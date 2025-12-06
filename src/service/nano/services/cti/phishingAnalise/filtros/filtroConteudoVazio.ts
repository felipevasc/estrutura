import { DecisaoFiltro, ResultadoFiltro } from "../tipos";

const filtroConteudoVazio = (html: string): ResultadoFiltro => {
    const texto = (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const decisao = texto ? DecisaoFiltro.PROSSEGUIR : DecisaoFiltro.DESCARTAR;
    const motivo = texto ? "" : "Pagina sem conteudo util";
    return { decisao, motivo, filtro: "conteudo_vazio" };
};

export default filtroConteudoVazio;
