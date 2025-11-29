export type DiretorioResponse = {
    id: number;
    caminho: string;
    status?: number | null;
    tamanho?: number | null;
    dominioId?: number | null;
    ipId?: number | null;
    tipo?: 'diretorio' | 'arquivo';
}
