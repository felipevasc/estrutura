export enum ResultadoFiltro {
    Prosseguir = 'PROSSEGUIR',
    Possivel = 'POSSIVEL',
    Descartar = 'DESCARTAR'
}

export type RetornoFiltro = { resultado: ResultadoFiltro; detalhe?: string };
export type FiltroPhishing = (html: string) => RetornoFiltro;
export type AvaliacaoFiltro = { filtro: string; resultado: ResultadoFiltro; detalhe?: string };
