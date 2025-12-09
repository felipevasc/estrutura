import { DiretorioResponse } from "./DiretorioResponse";
import { IpResponse } from "./IpResponse";
import { WhatwebResultadoResponse } from "./WhatwebResultadoResponse";
import { InformacaoDominioResponse } from "./InformacaoDominioResponse";
import { TipoDominio } from "@prisma/client";

export type DominioResponse = {
    id?: number;
    endereco?: string;
    alias?: string | null;
    tipo?: TipoDominio;
    projetoId?: number;
    paiId?: number | null;
    subDominios?: DominioResponse[];
    ips?: IpResponse[];
    diretorios?: DiretorioResponse[];
    whatwebResultados?: WhatwebResultadoResponse[];
    informacoes?: InformacaoDominioResponse[];
}
