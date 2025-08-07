import { DominioResponse } from "./DominioResponse";
import { PortaResponse } from "./PortaResponse";
import { RedeResponse } from "./RedeResponse";

export type IpResponse = {
    id: number;
    endereco: string;
    projetoId: number;
    dominios: DominioResponse[];
    redes: RedeResponse[];
    portas: PortaResponse[];
}