import prisma from "@/database";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Id da porta é obrigatório" }, { status: 400 });

    const porta = await prisma.porta.findUnique({
        where: { id: Number(id) },
        include: {
            ip: { select: { id: true, endereco: true, projetoId: true } },
            whatwebResultados: true,
        }
    });

    if (!porta) return NextResponse.json({ error: "Porta não encontrada" }, { status: 404 });

    return NextResponse.json(porta);
}
