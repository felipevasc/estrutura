import { DecisaoFiltro, ResultadoFiltro } from "../tipos";

const filtroInteracaoLimitada = (html: string): ResultadoFiltro => {
    const alvo = (html || "").toLowerCase();
    const interacoes = ["<input", "<select", "<textarea", "<button", "href=", "onclick="];
    const existe = interacoes.some((trecho) => alvo.includes(trecho));
    const decisao = existe ? DecisaoFiltro.PROSSEGUIR : DecisaoFiltro.DESCARTAR;
    const motivo = existe ? "" : "Sem formularios ou interacoes";
    return { decisao, motivo, filtro: "interacao_limitada" };
};

export default filtroInteracaoLimitada;
