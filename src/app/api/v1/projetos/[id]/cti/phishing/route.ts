import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { PhishingStatus } from "@prisma/client";

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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        if (isNaN(projetoId)) return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });

        const corpo = await request.json() as { id?: number; status?: PhishingStatus };
        const phishingId = Number(corpo?.id);
        const status = corpo?.status;
        if (!phishingId || !status) return NextResponse.json({ error: "Dados obrigatórios" }, { status: 400 });
        if (!Object.values(PhishingStatus).includes(status)) return NextResponse.json({ error: "Status inválido" }, { status: 400 });

        const registro = await prisma.phishing.findFirst({ where: { id: phishingId, dominio: { projetoId } } });
        if (!registro) return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 });

        const atualizado = await prisma.phishing.update({ where: { id: registro.id }, data: { status } });
        return NextResponse.json(atualizado);
    } catch (erro) {
        console.error("Erro ao atualizar status de phishing:", erro);
        return NextResponse.json({ error: "Erro interno ao atualizar status." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        if (isNaN(projetoId)) return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });

        const corpo = await request.json().catch(() => null) as { id?: number } | null;
        const phishingId = Number(corpo?.id);

        if (phishingId) {
            const registro = await prisma.phishing.findFirst({ where: { id: phishingId, dominio: { projetoId } } });
            if (!registro) return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 });
            await prisma.phishing.delete({ where: { id: registro.id } });
            return NextResponse.json({ message: "Registro removido." });
        }

        await prisma.phishing.deleteMany({ where: { dominio: { projetoId } } });
        return NextResponse.json({ message: "Dados de phishing removidos." });
    } catch (erro) {
        console.error("Erro ao limpar phishing:", erro);
        return NextResponse.json({ error: "Erro interno ao limpar phishing." }, { status: 500 });
    }
}
