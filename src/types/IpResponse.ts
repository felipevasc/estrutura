import { DominioResponse } from "./DominioResponse";
import { RedeResponse } from "./RedeResponse";
import { PortaResponse } from "./PortaResponse";

export type IpResponse = {
    id?: number;
    endereco?: string;
    projetoId?: number;
    dominios?: DominioResponse[];
    redes?: RedeResponse[];
    portas?: PortaResponse[];
}