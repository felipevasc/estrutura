import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { DominioResponse } from "@/types/DominioResponse";
import { NextResponse } from "next/server";

export async function GET(): ApiResponse<DominioResponse[]> {
    const ret = await prisma.dominio.findMany();
    return NextResponse.json(ret);
}

export async function POST(request: Request): ApiResponse<DominioResponse> {
    const body = await request.json();
    console.log(body);
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
        },
    });

    return NextResponse.json(ret);
}