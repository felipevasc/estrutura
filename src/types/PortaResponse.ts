import { IpResponse } from "./IpResponse";

export type PortaResponse = {
    id?: number;
    numero?: number;
    protocolo?: string;
    estado?: string | null;
    servico?: string | null;
    ipId?: number;
    ip?: IpResponse;
};
