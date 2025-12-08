import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { PhishingVerificacaoStatus } from "@prisma/client";

type ContextoProjeto = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, contexto: ContextoProjeto) {
    try {
        const projetoId = parseInt((await contexto.params).id, 10);
        if (isNaN(projetoId)) return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 });

        const resultado = await prisma.phishing.deleteMany({
            where: { dominio: { projetoId }, statusUltimaVerificacao: PhishingVerificacaoStatus.OFFLINE }
        });

        return NextResponse.json({ message: `${resultado.count} domínios removidos.` });
    } catch (erro) {
        console.error("Erro ao remover domínios offline:", erro);
        return NextResponse.json({ error: "Erro interno ao excluir domínios offline." }, { status: 500 });
    }
}
