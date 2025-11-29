import { DiretorioResponse } from "./DiretorioResponse";
import { DominioResponse } from "./DominioResponse";
import { PortaResponse } from "./PortaResponse";
import { RedeResponse } from "./RedeResponse";
import { UsuarioResponse } from "./UsuarioResponse";
import { WhatwebResultadoResponse } from "./WhatwebResultadoResponse";

export type IpResponse = {
    id: number;
    endereco: string;
    projetoId: number;
    portas?: PortaResponse[];
    dominios?: DominioResponse[];
    redes?: RedeResponse[];
    usuarios?: UsuarioResponse[];
    diretorios?: DiretorioResponse[];
    whatwebResultados?: WhatwebResultadoResponse[];
}
