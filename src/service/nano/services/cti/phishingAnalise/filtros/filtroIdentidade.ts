import { DecisaoFiltro, ResultadoFiltro } from "../tipos";

const filtroIdentidade = (html: string): ResultadoFiltro => {
    const alvo = (html || "").toLowerCase();
    const termos = ["cpf", "rg", "cnh", "passport", "ssn", "identidade", "documento", "comprovante"];
    const encontrado = termos.some((termo) => alvo.includes(termo));
    const decisao = encontrado ? DecisaoFiltro.POSSIVEL : DecisaoFiltro.PROSSEGUIR;
    const motivo = encontrado ? "Solicitacao de identidade" : "";
    return { decisao, motivo, filtro: "identidade" };
};

export default filtroIdentidade;
