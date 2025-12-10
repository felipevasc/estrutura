export type DominioDiretorioResponse = {
    id?: number;
    endereco?: string;
    alias?: string | null;
};

export type IpDiretorioResponse = {
    id?: number;
    endereco?: string;
};

import { WhatwebResultadoResponse } from "./WhatwebResultadoResponse";

export type DiretorioResponse = {
    id: number;
    caminho: string;
    status?: number | null;
    tamanho?: number | null;
    dominioId?: number | null;
    ipId?: number | null;
    tipo?: 'diretorio' | 'arquivo';
    criadoEm?: string;
    captura?: string | null;
    capturadoEm?: string | null;
    dominio?: DominioDiretorioResponse | null;
    ip?: IpDiretorioResponse | null;
    whatwebResultados?: WhatwebResultadoResponse[];
}
