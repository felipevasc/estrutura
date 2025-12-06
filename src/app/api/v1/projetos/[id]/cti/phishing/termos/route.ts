import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { carregarBasePhishing } from "@/utils/basePhishing";

const responderErro = (mensagem: string, status = 400) => NextResponse.json({ error: mensagem }, { status });

const normalizarPalavras = (lista: any[]) => Array.from(new Set((lista || []).map((termo: any) => String(termo || "").toLowerCase().trim()).filter(Boolean)));
const normalizarTlds = (lista: any[]) => Array.from(new Set((lista || []).map((tld: any) => String(tld || "").toLowerCase().replace(/^\./, "")).filter(Boolean))));

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        const dominioId = parseInt(request.nextUrl.searchParams.get("dominioId") || "", 10);
        if (isNaN(projetoId) || isNaN(dominioId)) return responderErro("Parâmetros inválidos");

        const dominio = await prisma.dominio.findFirst({ where: { id: dominioId, projetoId } });
        if (!dominio) return responderErro("Domínio não encontrado", 404);

        const base = await carregarBasePhishing(dominio);
        if (!base.palavrasChave.length || !base.tlds.length) return responderErro("Nenhuma base disponível", 422);

        return NextResponse.json(base);
    } catch (erro) {
        console.error("Erro ao carregar termos de phishing:", erro);
        return responderErro("Erro interno ao carregar termos", 500);
    }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        const corpo = await request.json() as { dominioId?: number; palavrasChave?: string[]; tlds?: string[] };
        if (isNaN(projetoId) || !corpo?.dominioId) return responderErro("Parâmetros inválidos");

        const dominio = await prisma.dominio.findFirst({ where: { id: corpo.dominioId, projetoId } });
        if (!dominio) return responderErro("Domínio não encontrado", 404);

        const palavrasChave = normalizarPalavras(corpo.palavrasChave);
        if (!palavrasChave.length) return responderErro("Lista de palavras vazia", 422);
        const tlds = normalizarTlds(corpo.tlds);
        if (!tlds.length) return responderErro("Lista de TLDs vazia", 422);

        await prisma.$transaction([
            prisma.termoPhishing.deleteMany({ where: { dominioId: dominio.id } }),
            prisma.tldPhishing.deleteMany({ where: { dominioId: dominio.id } }),
            ...palavrasChave.map(termo => prisma.termoPhishing.create({ data: { termo, dominioId: dominio.id } })),
            ...tlds.map(tld => prisma.tldPhishing.create({ data: { tld, dominioId: dominio.id } }))
        ]);

        const base = await carregarBasePhishing(dominio);
        return NextResponse.json(base);
    } catch (erro) {
        console.error("Erro ao salvar termos de phishing:", erro);
        return responderErro("Erro interno ao salvar termos", 500);
    }
}
