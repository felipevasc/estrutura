import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database";
import { carregarBasePhishing } from "@/utils/basePhishing";
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

const gerarBasePermitida = async (dominioId: number) => {
    const dominio = await prisma.dominio.findFirst({ where: { id: dominioId } });
    if (!dominio) return { palavras: [] as string[], tlds: [] as string[] };
    const base = await carregarBasePhishing(dominio);
    const palavras = gerarTermosPhishing(base.palavrasChave, base.palavrasAuxiliares);
    return { palavras, tlds: base.tlds };
};

const aplicarBase = (palavras: { termo: string; peso: number }[], permitidos: string[], tldsBase: string[], tldsEntrada: string[]) => {
    const listaPermitidos = new Set(permitidos.map(item => item.toLowerCase()));
    const filtrados = palavras.filter(item => listaPermitidos.has(item.termo.toLowerCase()));
    const existentes = new Set(filtrados.map(item => item.termo));
    listaPermitidos.forEach(termo => { if (!existentes.has(termo)) filtrados.push({ termo, peso: 3 }); });
    const tlds = tldsEntrada.length ? tldsEntrada : tldsBase;
    return { palavras: filtrados, tlds };
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projetoId = parseInt((await params).id, 10);
        const dominioId = parseInt(request.nextUrl.searchParams.get("dominioId") || "", 10);
        if (isNaN(projetoId) || isNaN(dominioId)) return responderErro("Parâmetros inválidos");

        const dominio = await prisma.dominio.findFirst({ where: { id: dominioId, projetoId } });
        if (!dominio) return responderErro("Domínio não encontrado", 404);

        const existente = await prisma.configuracaoPhishingCatcher.findUnique({ where: { dominioId } });
        const base = await gerarBasePermitida(dominio.id);
        if (!existente) {
            const padrao = aplicarBase([], base.palavras, base.tlds, []);
            await prisma.configuracaoPhishingCatcher.create({ data: { dominioId, palavras: padrao.palavras, tlds: padrao.tlds } });
            return NextResponse.json(padrao);
        }

        const palavras = normalizarPalavras(existente.palavras as any[]);
        const tlds = normalizarTlds(existente.tlds as any[]);
        return NextResponse.json(aplicarBase(palavras, base.palavras, base.tlds, tlds));
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

        const base = await gerarBasePermitida(dominio.id);
        const palavras = normalizarPalavras(corpo.palavras || []);
        const tlds = normalizarTlds(corpo.tlds || []);
        const sincronizado = aplicarBase(palavras, base.palavras, base.tlds, tlds);
        if (!sincronizado.palavras.length) return responderErro("Inclua ao menos uma palavra-chave", 422);
        if (!sincronizado.tlds.length) return responderErro("Inclua ao menos um TLD", 422);

        const configuracao = await prisma.configuracaoPhishingCatcher.upsert({
            where: { dominioId: dominio.id },
            update: { palavras: sincronizado.palavras, tlds: sincronizado.tlds },
            create: { dominioId: dominio.id, palavras: sincronizado.palavras, tlds: sincronizado.tlds }
        });

        return NextResponse.json({ palavras: configuracao.palavras, tlds: configuracao.tlds });
    } catch (erro) {
        console.error("Erro ao salvar configuração do phishing_catcher:", erro);
        return responderErro("Erro interno ao salvar configuração", 500);
    }
}
