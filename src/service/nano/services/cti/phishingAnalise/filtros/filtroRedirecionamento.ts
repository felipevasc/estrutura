import { DecisaoFiltro, ResultadoFiltro } from "../tipos";

const filtroRedirecionamento = (html: string): ResultadoFiltro => {
    const alvo = (html || "").toLowerCase();
    const indicadores = ["http-equiv=\"refresh\"", "meta refresh", "window.location", "location.replace", "settimeout(\"location", "setinterval(\"location"];
    const encontrado = indicadores.some((trecho) => alvo.includes(trecho));
    const decisao = encontrado ? DecisaoFiltro.POSSIVEL : DecisaoFiltro.PROSSEGUIR;
    const motivo = encontrado ? "Redirecionamento suspeito" : "";
    return { decisao, motivo, filtro: "redirecionamento" };
};

export default filtroRedirecionamento;
