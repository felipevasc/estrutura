import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { DominioResponse } from "@/types/DominioResponse";
import { NextRequest, NextResponse } from "next/server";
import { TipoDominio } from "@prisma/client";

const parseNumero = (valor?: string | null) => {
    if (!valor) return undefined;
    const numero = Number(valor);
    return Number.isNaN(numero) ? undefined : numero;
};

const montarIncludeIp = (limite?: number) => {
    const limiteAplicado = limite ? { take: limite } : {};
    return {
        include: {
            portas: { include: { whatwebResultados: true }, ...limiteAplicado },
            dominios: limiteAplicado,
            redes: true,
            usuarios: limiteAplicado,
            diretorios: { include: { whatwebResultados: true }, ...limiteAplicado },
            whatwebResultados: true,
        }
    };
};

const montarIncludeDominio = (limiteNivel?: number, limiteFilhos?: number, profundidade: number = 2, tipo: TipoDominio = TipoDominio.principal) => {
    const limiteNivelAplicado = limiteNivel ? { take: limiteNivel } : {};
    const incluirSubdominios = profundidade > 0 ? {
        subDominios: {
            where: { tipo },
            include: montarIncludeDominio(limiteFilhos, limiteFilhos, profundidade - 1, tipo),
            ...limiteNivelAplicado,
        }
    } : {};

    return {
        whatwebResultados: true,
        ips: montarIncludeIp(limiteFilhos),
        diretorios: { include: { whatwebResultados: true }, ...limiteNivelAplicado },
        ...incluirSubdominios,
    };
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): ApiResponse<DominioResponse[]> {
    const p = await params;
    const limiteNivel = parseNumero(req.nextUrl.searchParams.get("limite"));
    const limiteFilhos = parseNumero(req.nextUrl.searchParams.get("limiteFilhos"));
    const include = montarIncludeDominio(limiteNivel, limiteFilhos);

    const ret = await prisma.dominio.findMany({
        where: {
            projetoId: Number(p.id),
            pai: null,
            tipo: TipoDominio.principal,
        },
        include,
    });
    return NextResponse.json(ret);
}
