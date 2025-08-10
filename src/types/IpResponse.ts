import { DominioResponse } from "./DominioResponse";
import { PortaResponse } from "./PortaResponse";
import { RedeResponse } from "./RedeResponse";

export type IpResponse = {
    id: number;
    endereco: string;
    projetoId: number;
    portas: PortaResponse[];
    dominios: DominioResponse[];
    redes: RedeResponse[];
}