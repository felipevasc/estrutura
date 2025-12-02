import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { gerarTermosPhishing } from "@/utils/geradorTermosPhishing";

const responderErro = (mensagem: string, status = 400) => NextResponse.json({ error: mensagem }, { status });

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        const dominioId = parseInt(request.nextUrl.searchParams.get("dominioId") || "", 10);
        if (isNaN(projetoId) || isNaN(dominioId)) return responderErro("Parâmetros inválidos");

        const dominio = await prisma.dominio.findFirst({ where: { id: dominioId, projetoId } });
        if (!dominio) return responderErro("Domínio não encontrado", 404);

        let termos = await prisma.termoPhishing.findMany({ where: { dominioId }, orderBy: { termo: "asc" } });
        if (!termos.length) {
            const gerados = gerarTermosPhishing(dominio.endereco);
            if (!gerados.length) return responderErro("Não foi possível gerar termos", 422);
            const inseridos = await prisma.$transaction(gerados.map(termo => prisma.termoPhishing.create({ data: { termo, dominioId } })));
            termos = inseridos;
        }

        return NextResponse.json(termos.map(item => item.termo));
    } catch (erro) {
        console.error("Erro ao carregar termos de phishing:", erro);
        return responderErro("Erro interno ao carregar termos", 500);
    }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        const corpo = await request.json() as { dominioId?: number; termos?: string[] };
        if (isNaN(projetoId) || !corpo?.dominioId) return responderErro("Parâmetros inválidos");

        const dominio = await prisma.dominio.findFirst({ where: { id: corpo.dominioId, projetoId } });
        if (!dominio) return responderErro("Domínio não encontrado", 404);

        const lista = (corpo.termos || []).map(termo => termo.toLowerCase().trim()).filter(Boolean);
        const termosUnicos = Array.from(new Set(lista));
        if (!termosUnicos.length) return responderErro("Lista de termos vazia", 422);

        await prisma.$transaction([
            prisma.termoPhishing.deleteMany({ where: { dominioId: dominio.id } }),
            ...termosUnicos.map(termo => prisma.termoPhishing.create({ data: { termo, dominioId: dominio.id } }))
        ]);

        return NextResponse.json({ termos: termosUnicos });
    } catch (erro) {
        console.error("Erro ao salvar termos de phishing:", erro);
        return responderErro("Erro interno ao salvar termos", 500);
    }
}
