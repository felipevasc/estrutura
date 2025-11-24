"use server";

import { queueCommand } from "@/service/nano/commandHelper";
import prisma from "@/database";

export const executeNslookup = async (idDominio: number) => {
    const dom = await prisma.dominio.findUnique({ where: { id: idDominio } });
    if (!dom) throw new Error("Domain not found");

    await queueCommand('nslookup', { idDominio: idDominio }, dom.projetoId);
    return { success: true };
}
