import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { IpResponse } from "@/types/IpResponse";
import { NextRequest, NextResponse } from "next/server";

const parseNumero = (valor?: string | null) => {
    if (!valor) return undefined;
    const numero = Number(valor);
    return Number.isNaN(numero) ? undefined : numero;
};

const montarIncludeIp = (limite?: number) => {
    const limiteAplicado = limite ? { take: limite } : {};
    return {
        dominios: limiteAplicado,
        redes: true,
        portas: { include: { whatwebResultados: true }, ...limiteAplicado },
        usuarios: limiteAplicado,
        diretorios: { include: { whatwebResultados: true }, ...limiteAplicado },
        whatwebResultados: true,
    };
};

export async function GET(req: NextRequest): ApiResponse<IpResponse[]> {
    const limite = parseNumero(req.nextUrl.searchParams.get("limite"));
    const limiteFilhos = parseNumero(req.nextUrl.searchParams.get("limiteFilhos"));
    const include = montarIncludeIp(limite ?? limiteFilhos);

    const ret = await prisma.ip.findMany({
        include,
    });
    return NextResponse.json(ret);
}

export async function POST(req: NextRequest): ApiResponse<IpResponse> {
    const data = await req.json();
    const include = montarIncludeIp();
    const ret = await prisma.ip.create({
        data,
        include,
    });
    return NextResponse.json(ret);
}
