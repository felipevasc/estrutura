import { NextRequest, NextResponse } from "next/server";
import { queueCommand } from "@/service/nano/commandHelper";

type Payload = { dominioId: number };

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        if (isNaN(projetoId)) return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });

        const corpo = await request.json() as Payload;
        if (!corpo?.dominioId) return NextResponse.json({ error: "Domínio obrigatório" }, { status: 400 });

        await queueCommand("phishing_dnstwist_check", { dominioId: corpo.dominioId }, projetoId);
        return NextResponse.json({ message: "Busca de phishing enfileirada." });
    } catch (erro) {
        console.error("Erro ao enfileirar busca de phishing:", erro);
        return NextResponse.json({ error: "Erro interno ao enfileirar." }, { status: 500 });
    }
}
