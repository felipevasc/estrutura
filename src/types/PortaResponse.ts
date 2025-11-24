import { IpResponse } from "./IpResponse";

export type PortaResponse = {
    id: number;
    numero: number;
    protocolo: string | null;
    servico: string | null;
    versao: string | null;
    ipId: number | null;
    ip?: IpResponse | null; // Allow null from Prisma
}
