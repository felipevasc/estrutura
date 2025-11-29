export type DiretorioResponse = {
    id: number;
    caminho: string;
    status?: number | null;
    tamanho?: number | null;
    dominioId?: number | null;
    ipId?: number | null;
    tipo?: 'diretorio' | 'arquivo';
    createdAt?: string;
    dominio?: { id: number; endereco: string } | null;
    ip?: { id: number; endereco: string } | null;
}
