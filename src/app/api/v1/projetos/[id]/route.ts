import prisma from "@/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!id)
        return NextResponse.json({ error: "Id do projeto é obrigatório" }, { status: 400 })

    const ret = await prisma.projeto.findFirst({ where: { id: Number(id) } });
    return NextResponse.json(ret);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const body = await request.json();
    console.log(body);
    const { id } = await params
    if (!id)
        return NextResponse.json({ error: "Id do projeto é obrigatório" }, { status: 400 })
    if (!body.nome) {
        return NextResponse.json({ error: "Nome do projeto é obrigatório" }, { status: 400 });
    }

    const ret = await prisma.projeto.update({
        where: {
            id: Number(id)
        },
        data: {
            nome: body.nome,
            updatedAt: new Date()
        },
    });

    return NextResponse.json(ret);
    
}