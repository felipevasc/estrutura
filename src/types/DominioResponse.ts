import { DiretorioResponse } from "./DiretorioResponse";
import { IpResponse } from "./IpResponse";

export type DominioResponse = {
    id?: number;
    endereco?: string;
    alias?: string | null;
    projetoId?: number;
    paiId?: number | null;
    subDominios?: DominioResponse[];
    ips?: IpResponse[];
    diretorios?: DiretorioResponse[];
}
