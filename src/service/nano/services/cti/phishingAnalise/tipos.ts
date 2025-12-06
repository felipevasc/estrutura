import { PhishingStatus } from "@prisma/client";

enum DecisaoFiltro {
    DESCARTAR = "DESCARTAR",
    PROSSEGUIR = "PROSSEGUIR",
    POSSIVEL = "POSSIVEL_PHISHING"
}

type ResultadoFiltro = {
    decisao: DecisaoFiltro;
    motivo: string;
    filtro: string;
};

type FiltroPhishing = (html: string) => ResultadoFiltro;

type ResultadoAnalise = {
    salvar: boolean;
    status?: PhishingStatus;
    motivo: string;
    filtro: string;
};

export { DecisaoFiltro, ResultadoFiltro, FiltroPhishing, ResultadoAnalise };
