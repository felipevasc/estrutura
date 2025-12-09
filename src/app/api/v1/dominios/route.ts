import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { DominioResponse } from "@/types/DominioResponse";
import { NextResponse } from "next/server";
import { TipoDominio } from "@prisma/client";

const parseTipos = (valor?: string | null) => {
    const tiposDisponiveis = new Set(Object.values(TipoDominio));
    const tipos = valor?.split(',').map(t => t.trim()).filter(Boolean) as TipoDominio[] | undefined;
    const filtrados = tipos?.filter(t => tiposDisponiveis.has(t));
    return filtrados && filtrados.length > 0 ? filtrados : [TipoDominio.principal];
};

export async function GET(request: Request): ApiResponse<DominioResponse[]> {
    const url = new URL(request.url);
    const tipos = parseTipos(url.searchParams.get('tipos'));
    const ret = await prisma.dominio.findMany({ where: { tipo: { in: tipos } } });
    return NextResponse.json(ret);
}

export async function POST(request: Request): ApiResponse<DominioResponse> {
    const body = await request.json();
    if (!body.projetoId) {
        return NextResponse.json({ error: "ID do projeto é obrigatório" }, { status: 400 });
    }
    if (!body.endereco) {
        return NextResponse.json({ error: "Endereceo é obrigatório" }, { status: 400 });
    }

    const ret = await prisma.dominio.create({
        data: {
            endereco: body.endereco,
            projetoId: body.projetoId,
            alias: body.alias,
            tipo: TipoDominio.principal,
        },
    });

    return NextResponse.json(ret);
}