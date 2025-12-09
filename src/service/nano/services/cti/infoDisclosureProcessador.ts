import prisma from "@/database";
import { Dominio } from "@prisma/client";

export const salvarVazamentos = async (itens: any[], dominio: Dominio, fonte: string) => {
    const criados = [] as any[];
    for (const item of itens) {
        const url = item.link || item.url || item.html_url;
        if (!url) continue;
        const existente = await prisma.vazamentoInformacao.findFirst({ where: { url, dominioId: dominio.id } });
        if (existente) continue;
        const titulo = item.title || item.titulo || item.name || item.repository?.full_name;
        const snippet = item.snippet || item.path || item.summary || item.text_snippet;
        const criado = await prisma.vazamentoInformacao.create({ data: { url, fonte, titulo, snippet, dominioId: dominio.id } });
        criados.push(criado);
    }
    return criados;
};
