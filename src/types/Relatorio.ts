export interface ItemRelatorio {
    id: string;
    tipo: 'Dominio' | 'IP' | 'Porta' | 'Diretorio';
    valor: string;
    dominio?: string | null;
    ip?: string | null;
    porta?: number | null;
    servico?: string | null;
    protocolo?: string | null;
    status?: number | null;
    tamanho?: number | null;
    criadoEm?: string;
}

export type TipoRelatorioGrafico = 'barra' | 'linha' | 'pizza' | 'area';

export interface DadoGraficoRelatorio {
    nome: string;
    valor: number;
    valorSecundario?: number;
}

export interface ConfiguracaoRelatorio {
    chave: string;
    titulo: string;
    descricao: string;
    tipoGrafico: TipoRelatorioGrafico;
}

export interface ResultadoRelatorio {
    dadosGrafico: DadoGraficoRelatorio[];
    dadosTabela: ItemRelatorio[];
    tipoGrafico: TipoRelatorioGrafico;
    eixoX?: string;
    eixoY?: string;
    destaque?: string;
}
