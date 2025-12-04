import prisma from "@/database";
import { gerarDadosPhishing } from "./geradorTermosPhishing";
import { Dominio } from "@prisma/client";

export const carregarBasePhishing = async (dominio: Dominio) => {
    const palavrasExistentes = await prisma.termoPhishing.findMany({ where: { dominioId: dominio.id }, orderBy: { termo: "asc" } });
    const tldsExistentes = await prisma.tldPhishing.findMany({ where: { dominioId: dominio.id }, orderBy: { tld: "asc" } });
    const gerados = gerarDadosPhishing(dominio.endereco);

    const criarPalavras = palavrasExistentes.length ? [] : gerados.palavras.map(termo => prisma.termoPhishing.create({ data: { termo, dominioId: dominio.id } }));
    const criarTlds = tldsExistentes.length ? [] : gerados.tlds.map(tld => prisma.tldPhishing.create({ data: { tld, dominioId: dominio.id } }));
    if (criarPalavras.length || criarTlds.length) await prisma.$transaction([...criarPalavras, ...criarTlds]);

    const palavras = palavrasExistentes.length ? palavrasExistentes.map(item => item.termo) : gerados.palavras;
    const tlds = tldsExistentes.length ? tldsExistentes.map(item => item.tld) : gerados.tlds;

    return { palavras, tlds };
};
