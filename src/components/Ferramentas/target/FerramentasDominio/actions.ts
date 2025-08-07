"use server";

import { executarNslookup } from "@/service/tools/domain/nslookup";

export const executeNslookup = async (idDominio: number) => {
    return await executarNslookup(idDominio.toString());
}