import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { queueCommand } from "@/service/nano/commandHelper";

const responderErro = (mensagem: string, status = 400) => NextResponse.json({ error: mensagem }, { status });

type CorpoRequisicao = { dominioId?: number; alvo?: string; html?: string; fonte?: string; termo?: string };

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        const corpo = await request.json() as CorpoRequisicao;
        const dominioId = Number(corpo?.dominioId);
        const alvo = String(corpo?.alvo || '').trim().toLowerCase();
        const html = typeof corpo?.html === 'string' ? corpo.html : '';
        if (!projetoId || !dominioId || !alvo) return responderErro('Parâmetros inválidos');

        const dominio = await prisma.dominio.findFirst({ where: { id: dominioId, projetoId } });
        if (!dominio) return responderErro('Domínio não encontrado', 404);

        await queueCommand('phishing_analisar', { dominioId, alvo, html, fonte: corpo.fonte, termo: corpo.termo }, projetoId);
        return NextResponse.json({ message: 'Análise de phishing enfileirada.' });
    } catch (erro) {
        console.error('Erro ao enfileirar análise de phishing:', erro);
        return responderErro('Erro interno ao enfileirar análise', 500);
    }
}
