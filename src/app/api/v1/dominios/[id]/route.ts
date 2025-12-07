import prisma from "@/database";
import { NextRequest, NextResponse } from "next/server";
import { TipoDominio } from "@prisma/client";
import { montarIncludeDominio } from "../includes";

const obterLimite = (req: NextRequest) => {
    const limite = Number(req.nextUrl.searchParams.get("limiteFilhos") ?? 0);
    if (Number.isNaN(limite)) return 0;
    return limite;
};

const obterLimitarDiretos = (req: NextRequest) => req.nextUrl.searchParams.get("limitarDiretos") !== "false";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id)
        return NextResponse.json({ error: "Id do dominio é obrigatório" }, { status: 400 });

    const limiteFilhos = obterLimite(req);
    const limitarDiretos = obterLimitarDiretos(req);

    const ret = await prisma.dominio.findFirst({
        where: { id: Number(id), tipo: TipoDominio.principal },
        include: montarIncludeDominio(limiteFilhos, limitarDiretos),
    });
    return NextResponse.json(ret);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const body = await request.json();
    const { id } = await params;
    if (!id)
        return NextResponse.json({ error: "Id do dominio é obrigatório" }, { status: 400 });
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
