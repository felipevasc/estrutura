import { DiretorioResponse } from "./DiretorioResponse";
import { IpResponse } from "./IpResponse";
import { WhatwebResultadoResponse } from "./WhatwebResultadoResponse";
import { InformacaoDominioResponse } from "./InformacaoDominioResponse";
import { $Enums } from "@prisma/client";

export type DominioResponse = {
    id?: number;
    endereco?: string;
    alias?: string | null;
    captura?: string | null;
    capturadoEm?: Date | null;
    tipo?: $Enums.TipoDominio;
    projetoId?: number;
    paiId?: number | null;
    subDominios?: DominioResponse[];
    ips?: IpResponse[];
    diretorios?: DiretorioResponse[];
    whatwebResultados?: WhatwebResultadoResponse[];
    informacoes?: InformacaoDominioResponse[];
}
