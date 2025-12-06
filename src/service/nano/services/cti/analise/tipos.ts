export enum DecisaoFiltro {
    DESCONSIDERAR = "DESCONSIDERAR",
    POSSIVEL_PHISHING = "POSSIVEL_PHISHING",
    NEUTRO = "NEUTRO"
}

export interface ResultadoFiltro {
    decisao: DecisaoFiltro;
    motivo?: string;
}

export interface FiltroPhishing {
    analisar(conteudo: string): Promise<ResultadoFiltro>;
}
