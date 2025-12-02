import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { gerarTermosPhishing } from "@/utils/geradorTermosPhishing";

const responderErro = (mensagem: string, status = 400) => NextResponse.json({ error: mensagem }, { status });

const normalizarPalavras = (lista: any[]) => {
    const palavras = Array.isArray(lista) ? lista : [];
    const tratadas = palavras.map(item => ({
        termo: String((item?.termo ?? item?.palavra ?? "")).toLowerCase().trim(),
        peso: Math.max(1, Number(item?.peso) || 1)
    })).filter(item => item.termo);
    const unicas = new Map<string, { termo: string; peso: number }>();
    for (const item of tratadas) unicas.set(item.termo, item);
    return Array.from(unicas.values());
};

const normalizarTlds = (lista: any[]) => {
    const tlds = Array.isArray(lista) ? lista : [];
    return Array.from(new Set(tlds.map(item => String(item || "").toLowerCase().replace(/^\./, "")).filter(Boolean)));
};

const gerarPadrao = async (dominioId: number, endereco: string) => {
    const termos = await prisma.termoPhishing.findMany({ where: { dominioId }, orderBy: { termo: "asc" } });
    const base = termos.length ? termos.map(item => item.termo) : gerarTermosPhishing(endereco);
    const palavras = Array.from(new Set(base)).map(termo => ({ termo: termo.toLowerCase(), peso: 3 }));
    const tlds = ["com", "net", "org", "io", "br"];
    return { palavras, tlds };
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        const dominioId = parseInt(request.nextUrl.searchParams.get("dominioId") || "", 10);
        if (isNaN(projetoId) || isNaN(dominioId)) return responderErro("Parâmetros inválidos");

        const dominio = await prisma.dominio.findFirst({ where: { id: dominioId, projetoId } });
        if (!dominio) return responderErro("Domínio não encontrado", 404);

        const existente = await prisma.configuracaoPhishingCatcher.findUnique({ where: { dominioId } });
        if (!existente) {
            const padrao = await gerarPadrao(dominio.id, dominio.endereco);
            await prisma.configuracaoPhishingCatcher.create({ data: { dominioId, palavras: padrao.palavras, tlds: padrao.tlds } });
            return NextResponse.json(padrao);
        }

        const palavras = normalizarPalavras(existente.palavras as any[]);
        const tlds = normalizarTlds(existente.tlds as any[]);
        return NextResponse.json({ palavras, tlds });
    } catch (erro) {
        console.error("Erro ao carregar configuração do phishing_catcher:", erro);
        return responderErro("Erro interno ao carregar configuração", 500);
    }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        const corpo = await request.json() as { dominioId?: number; palavras?: any[]; tlds?: any[] };
        if (isNaN(projetoId) || !corpo?.dominioId) return responderErro("Parâmetros inválidos");

        const dominio = await prisma.dominio.findFirst({ where: { id: corpo.dominioId, projetoId } });
        if (!dominio) return responderErro("Domínio não encontrado", 404);

        const palavras = normalizarPalavras(corpo.palavras || []);
        if (!palavras.length) return responderErro("Inclua ao menos uma palavra-chave", 422);
        const tlds = normalizarTlds(corpo.tlds || []);
        if (!tlds.length) return responderErro("Inclua ao menos um TLD", 422);

        const configuracao = await prisma.configuracaoPhishingCatcher.upsert({
            where: { dominioId: dominio.id },
            update: { palavras, tlds },
            create: { dominioId: dominio.id, palavras, tlds }
        });

        return NextResponse.json({ palavras: configuracao.palavras, tlds: configuracao.tlds });
    } catch (erro) {
        console.error("Erro ao salvar configuração do phishing_catcher:", erro);
        return responderErro("Erro interno ao salvar configuração", 500);
    }
}
