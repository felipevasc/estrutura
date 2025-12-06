import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { PhishingStatus } from "@prisma/client";

const responderErro = (mensagem: string, status = 400) => NextResponse.json({ error: mensagem }, { status });

type CorpoRequisicao = { id?: number; status?: PhishingStatus };

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        const corpo = await request.json() as CorpoRequisicao;
        const phishingId = Number(corpo?.id);
        const status = corpo?.status;
        if (!projetoId || !phishingId || !status) return responderErro('Parâmetros inválidos');

        const valores = Object.values(PhishingStatus) as string[];
        if (!valores.includes(status)) return responderErro('Status inválido');

        const registro = await prisma.phishing.findFirst({ where: { id: phishingId, dominio: { projetoId } } });
        if (!registro) return responderErro('Registro não encontrado', 404);

        const atualizado = await prisma.phishing.update({ where: { id: registro.id }, data: { status } });
        return NextResponse.json(atualizado);
    } catch (erro) {
        console.error('Erro ao atualizar status de phishing:', erro);
        return responderErro('Erro interno ao atualizar status', 500);
    }
}
