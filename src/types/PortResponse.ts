export type PortResponse = {
    id?: number;
    numero?: number;
    protocolo?: string | null;
    servico?: string | null;
    estado?: string | null;
    ipId?: number;
    ip?: { endereco?: string };
}

