export interface ItemRelatorio {
    id: string;
    tipo: 'Dominio' | 'IP' | 'Porta' | 'Diretorio';
    valor: string;

    // Contexto
    dominio?: string | null;
    ip?: string | null;

    // Detalhes
    porta?: number | null;
    servico?: string | null;
    protocolo?: string | null;
    status?: number | null;
    tamanho?: number | null;

    criadoEm?: string;
}
