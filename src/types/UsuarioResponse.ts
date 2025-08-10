import { IpResponse } from "./IpResponse";

export type UsuarioResponse = {
    id: number;
    nome: string;
    ipId: number;
    ip?: IpResponse;
}
