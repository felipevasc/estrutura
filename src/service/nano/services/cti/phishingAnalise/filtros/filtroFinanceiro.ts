import { DecisaoFiltro, ResultadoFiltro } from "../tipos";

const filtroFinanceiro = (html: string): ResultadoFiltro => {
    const alvo = (html || "").toLowerCase();
    const termos = ["cartao", "credito", "debito", "cvv", "pix", "boleto", "pagamento", "fatura", "banco", "transferencia"];
    const encontrado = termos.some((termo) => alvo.includes(termo));
    const decisao = encontrado ? DecisaoFiltro.POSSIVEL : DecisaoFiltro.PROSSEGUIR;
    const motivo = encontrado ? "Solicitacao de dados financeiros" : "";
    return { decisao, motivo, filtro: "financeiro" };
};

export default filtroFinanceiro;
