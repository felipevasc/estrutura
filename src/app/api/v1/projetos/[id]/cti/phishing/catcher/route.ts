import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { queueCommand } from "@/service/nano/commandHelper";

const responderErro = (mensagem: string, status = 400) => NextResponse.json({ error: mensagem }, { status });

export async function POST(request: NextRequest, contexto: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await contexto.params;
        const projetoId = parseInt(id, 10);
        const corpo = await request.json() as { dominioId?: number };
        if (isNaN(projetoId) || !corpo?.dominioId) return responderErro("Parâmetros inválidos");

        const dominio = await prisma.dominio.findFirst({ where: { id: corpo.dominioId, projetoId } });
        if (!dominio) return responderErro("Domínio não encontrado", 404);

        await queueCommand("phishing_catcher_check", { dominioId: dominio.id }, projetoId);
        return NextResponse.json({ message: "Consulta do phishing_catcher enfileirada." });
    } catch (erro) {
        console.error("Erro ao enfileirar phishing_catcher:", erro);
        return responderErro("Erro interno ao enfileirar", 500);
    }
}
