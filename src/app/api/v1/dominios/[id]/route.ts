import prisma from "@/database";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, TipoDominio } from "@prisma/client";

const parseNumero = (valor?: string | null) => {
    if (!valor) return undefined;
    const numero = Number(valor);
    return Number.isNaN(numero) ? undefined : numero;
};

const parseTipos = (valor?: string | null) => {
    const tiposDisponiveis = new Set(Object.values(TipoDominio));
    const tipos = valor?.split(',').map(t => t.trim()).filter(Boolean) as TipoDominio[] | undefined;
    const filtrados = tipos?.filter(t => tiposDisponiveis.has(t));
    return filtrados && filtrados.length > 0 ? filtrados : [TipoDominio.principal];
};

const montarIncludeIp = (limite?: number): Prisma.IpFindManyArgs => {
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

const montarIncludeDominio = (limiteNivel?: number, limiteFilhos?: number, profundidade: number = 2, tipos: TipoDominio[] = [TipoDominio.principal]): Prisma.DominioInclude => {
    const limiteNivelAplicado = limiteNivel ? { take: limiteNivel } : {};
    const incluirSubdominios: Prisma.DominioInclude = profundidade > 0 ? {
        subDominios: {
            where: { tipo: { in: tipos } },
            include: montarIncludeDominio(limiteFilhos, limiteFilhos, profundidade - 1, tipos),
            ...limiteNivelAplicado,
        }
    } : {};

    return {
        whatwebResultados: true,
        ips: montarIncludeIp(limiteFilhos),
        diretorios: { include: { whatwebResultados: true }, ...limiteNivelAplicado },
        informacoes: true,
        ...incluirSubdominios,
    };
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id)
        return NextResponse.json({ error: "Id do dominio é obrigatório" }, { status: 400 });

    const limiteNivel = parseNumero(req.nextUrl.searchParams.get("limite"));
    const limiteFilhos = parseNumero(req.nextUrl.searchParams.get("limiteFilhos"));
    const tipos = parseTipos(req.nextUrl.searchParams.get("tipos"));
    const include = montarIncludeDominio(limiteNivel, limiteFilhos, undefined, tipos);

    const ret = await prisma.dominio.findFirst({
        where: { id: Number(id), tipo: { in: tipos } },
        include,
    });
    return NextResponse.json(ret);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const body = await request.json();
    console.log(body);
    const { id } = await params
    if (!id)
        return NextResponse.json({ error: "Id do dominio é obrigatório" }, { status: 400 })
    if (!body.projetoId) {
        return NextResponse.json({ error: "Nome do projeto é obrigatório" }, { status: 400 });
    }
    const ret = await prisma.dominio.update({
        where: {
            id: Number(id)
        },
        data: {
            endereco: body.endereco,
            alias: body.alias,
            projetoId: body.projetoId,
        },
    });
    return NextResponse.json(ret);
}