import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { queueCommand } from "@/service/nano/commandHelper";

type Payload = { dominioId?: number; ids?: number[] };

export async function POST(request: NextRequest, contexto: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await contexto.params;
        const projetoId = parseInt(id, 10);
        if (isNaN(projetoId)) return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });

        const corpo = await request.json() as Payload;
        const ids = Array.isArray(corpo?.ids) ? corpo.ids.map((item) => Number(item)).filter((item) => !isNaN(item)) : [];
        const dominioId = Number(corpo?.dominioId) || null;

        let alvoDominio: number | null = null;
        if (dominioId) {
            const dominio = await prisma.dominio.findFirst({ where: { id: dominioId, projetoId } });
            if (!dominio) return NextResponse.json({ error: "Domínio não encontrado" }, { status: 404 });
            alvoDominio = dominio.id;
        }

        await queueCommand("phishing_capturar", { projetoId, dominioId: alvoDominio, ids }, projetoId);
        return NextResponse.json({ message: "Capturas enfileiradas." });
    } catch (erro) {
        console.error("Erro ao enfileirar capturas:", erro);
        return NextResponse.json({ error: "Erro interno ao enfileirar capturas." }, { status: 500 });
    }
}
