import prisma from "@/database";
import { ApiResponse } from "@/types/ApiResponse";
import { ProjetoResponse } from "@/types/ProjetoResponse";
import { NextResponse } from "next/server";

export async function GET(): ApiResponse<ProjetoResponse[]> {
    const ret = await prisma.projeto.findMany();
    return NextResponse.json(ret);
}

export async function POST(request: Request): ApiResponse<ProjetoResponse> {
    const body = await request.json();
    console.log(body);
    if (!body.nome) {
        return NextResponse.json({ error: "Nome do projeto é obrigatório" }, { status: 400 });
    }

    const ret = await prisma.projeto.create({
        data: {
            nome: body.nome,
            createdAt: new Date(),
            updatedAt: new Date()
        },
    });

    return NextResponse.json(ret);
}