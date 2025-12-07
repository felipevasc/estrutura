import prisma from "@/database";
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id)
        return NextResponse.json({ error: "Id do IP é obrigatório" }, { status: 400 });

    const limite = parseNumero(req.nextUrl.searchParams.get("limite"));
    const limiteFilhos = parseNumero(req.nextUrl.searchParams.get("limiteFilhos"));
    const include = montarIncludeIp(limite ?? limiteFilhos);

    const ret = await prisma.ip.findFirst({
        where: { id: Number(id) },
        include,
    });
    return NextResponse.json(ret);
}
