import { PhishingStatus } from "@prisma/client";
import filtros from "./filtros";
import { DecisaoFiltro, ResultadoAnalise } from "./tipos";

const analisarHtmlPhishing = (html: string): ResultadoAnalise => {
    for (const filtro of filtros) {
        const resultado = filtro(html || "");
        if (resultado.decisao === DecisaoFiltro.PROSSEGUIR) continue;
        if (resultado.decisao === DecisaoFiltro.DESCARTAR) return { salvar: false, motivo: resultado.motivo, filtro: resultado.filtro };
        return { salvar: true, status: PhishingStatus.POSSIVEL_PHISHING, motivo: resultado.motivo, filtro: resultado.filtro };
    }
    return { salvar: true, status: PhishingStatus.NECESSARIO_ANALISE, motivo: "Nenhum filtro conclusivo", filtro: "fluxo" };
};

export { analisarHtmlPhishing };
