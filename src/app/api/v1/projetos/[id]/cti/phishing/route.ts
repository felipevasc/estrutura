import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        if (isNaN(projetoId)) return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });

        const registros = await prisma.phishing.findMany({
            where: { dominio: { projetoId } },
            include: { dominio: { select: { endereco: true } } },
            orderBy: { criadoEm: "desc" }
        });

        return NextResponse.json(registros);
    } catch (erro) {
        console.error("Erro ao buscar resultados de phishing:", erro);
        return NextResponse.json({ error: "Erro interno ao buscar phishing." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        if (isNaN(projetoId)) return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });

        await prisma.phishing.deleteMany({ where: { dominio: { projetoId } } });
        return NextResponse.json({ message: "Dados de phishing removidos." });
    } catch (erro) {
        console.error("Erro ao limpar phishing:", erro);
        return NextResponse.json({ error: "Erro interno ao limpar phishing." }, { status: 500 });
    }
}
