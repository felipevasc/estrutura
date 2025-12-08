import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { queueCommand } from "@/service/nano/commandHelper";

type Payload = { ids?: number[] };

export async function POST(request: NextRequest, contexto: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await contexto.params;
        const projetoId = parseInt(id, 10);
        if (isNaN(projetoId)) return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });

        const corpo = await request.json() as Payload;
        const idsValidos = Array.isArray(corpo.ids) ? corpo.ids.filter((id) => typeof id === "number") : [];

        const filtros = { dominio: { projetoId } } as { dominio: { projetoId: number }; id?: { in: number[] } };
        if (idsValidos.length) filtros.id = { in: idsValidos };

        const registros = await prisma.phishing.findMany({ where: filtros, select: { id: true } });
        if (!registros.length) return NextResponse.json({ error: "Nenhum alvo encontrado para verificação." }, { status: 400 });

        for (const entrada of registros) await queueCommand("phishing_verificar", { id: entrada.id }, projetoId);

        return NextResponse.json({ message: `${registros.length} verificações enfileiradas.` });
    } catch (erro) {
        console.error("Erro ao enfileirar verificação de phishing:", erro);
        return NextResponse.json({ error: "Erro interno ao enfileirar verificações." }, { status: 500 });
    }
}
