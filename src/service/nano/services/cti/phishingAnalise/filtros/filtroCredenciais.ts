import { DecisaoFiltro, ResultadoFiltro } from "../tipos";

const filtroCredenciais = (html: string): ResultadoFiltro => {
    const alvo = (html || "").toLowerCase();
    const termos = ["password", "senha", "login", "verifique sua conta", "confirmar conta", "autenticacao", "2fa", "token"];
    const encontrado = termos.some((termo) => alvo.includes(termo));
    const decisao = encontrado ? DecisaoFiltro.POSSIVEL : DecisaoFiltro.PROSSEGUIR;
    const motivo = encontrado ? "Indicadores de credenciais" : "";
    return { decisao, motivo, filtro: "credenciais" };
};

export default filtroCredenciais;
