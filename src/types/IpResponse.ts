import { PortResponse } from "./PortResponse";
import { IpInfoResponse } from "./IpInfoResponse";
import { DominioResponse } from "./DominioResponse";
import { RedeResponse } from "./RedeResponse";

export type IpResponse = {
    id?: number;
    endereco?: string;
    projetoId?: number;
    dominios?: DominioResponse[];
    redes?: RedeResponse[];
    portas?: PortResponse[];
    infos?: IpInfoResponse[];
}