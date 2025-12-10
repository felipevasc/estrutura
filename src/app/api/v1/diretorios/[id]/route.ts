import prisma from "@/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id)
        return NextResponse.json({ error: "Id do diretório é obrigatório" }, { status: 400 });

    const diretorio = await prisma.diretorio.findUnique({
        where: { id: Number(id) },
        include: {
            dominio: { select: { id: true, endereco: true, alias: true } },
            ip: { select: { id: true, endereco: true } },
            whatwebResultados: true,
        }
    });

    if (!diretorio) return NextResponse.json({ error: "Diretório não encontrado" }, { status: 404 });

    const { createdAt, capturadoEm, ...dados } = diretorio;

    return NextResponse.json({ ...dados, criadoEm: createdAt, capturadoEm });
}
