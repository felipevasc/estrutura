import { PortaResponse } from "./PortaResponse";

export type IpResponse = {
    id?: number;
    endereco?: string;
    projetoId?: number;
    portas: PortaResponse[];
}