import { NextRequest, NextResponse } from "next/server";
import { queueCommand } from "@/service/nano/commandHelper";
import prisma from "@/database";

type Entrada = { dominioId?: number; alvo?: string; html?: string };

export async function POST(request: NextRequest, contexto: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await contexto.params;
        const projetoId = parseInt(id, 10);
        if (isNaN(projetoId)) return NextResponse.json({ error: "ID do projeto invalido" }, { status: 400 });

        const corpo = await request.json() as Entrada;
        const dominioId = Number(corpo?.dominioId);
        const alvo = String(corpo?.alvo || "").trim();
        if (!dominioId || !alvo) return NextResponse.json({ error: "Dados obrigatorios" }, { status: 400 });

        const dominio = await prisma.dominio.findFirst({ where: { id: dominioId, projetoId } });
        if (!dominio) return NextResponse.json({ error: "Dominio invalido" }, { status: 404 });

        await queueCommand("phishing_analise_pagina", { dominioId, alvo, html: corpo.html }, projetoId);
        return NextResponse.json({ message: "Analise de phishing enfileirada." });
    } catch (erro) {
        console.error("Erro ao enfileirar analise de phishing:", erro);
        return NextResponse.json({ error: "Erro interno ao enfileirar." }, { status: 500 });
    }
}
