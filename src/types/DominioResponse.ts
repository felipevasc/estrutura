import { DiretorioResponse } from "./DiretorioResponse";
import { IpResponse } from "./IpResponse";
import { WhatwebResultadoResponse } from "./WhatwebResultadoResponse";
import { InformacaoDominioResponse } from "./InformacaoDominioResponse";

export type DominioResponse = {
    id?: number;
    endereco?: string;
    alias?: string | null;
    tipo?: "principal" | "dns" | "mail";
    projetoId?: number;
    paiId?: number | null;
    subDominios?: DominioResponse[];
    ips?: IpResponse[];
    diretorios?: DiretorioResponse[];
    whatwebResultados?: WhatwebResultadoResponse[];
    informacoes?: InformacaoDominioResponse[];
}
