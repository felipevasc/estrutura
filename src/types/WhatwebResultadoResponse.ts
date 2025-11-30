export type WhatwebResultadoResponse = {
    id?: number;
    plugin: string;
    valor: string;
    dados?: unknown;
    diretorioId?: number | null;
    portaId?: number | null;
};
