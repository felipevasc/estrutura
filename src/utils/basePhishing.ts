import prisma from "@/database";
import { gerarDadosPhishing } from "./geradorTermosPhishing";
import { Dominio } from "@prisma/client";

export const carregarBasePhishing = async (dominio: Dominio) => {
    const palavrasExistentes = await prisma.termoPhishing.findMany({ where: { dominioId: dominio.id }, orderBy: { termo: "asc" } });
    const auxiliaresExistentes = await prisma.auxiliarPhishing.findMany({ where: { dominioId: dominio.id }, orderBy: { termo: "asc" } });
    const tldsExistentes = await prisma.tldPhishing.findMany({ where: { dominioId: dominio.id }, orderBy: { tld: "asc" } });
    const gerados = gerarDadosPhishing(dominio.endereco);

    const criarPalavras = palavrasExistentes.length ? [] : gerados.palavrasChave.map(termo => prisma.termoPhishing.create({ data: { termo, dominioId: dominio.id } }));
    const criarAuxiliares = auxiliaresExistentes.length ? [] : gerados.palavrasAuxiliares.map(termo => prisma.auxiliarPhishing.create({ data: { termo, dominioId: dominio.id } }));
    const criarTlds = tldsExistentes.length ? [] : gerados.tlds.map(tld => prisma.tldPhishing.create({ data: { tld, dominioId: dominio.id } }));
    if (criarPalavras.length || criarAuxiliares.length || criarTlds.length) await prisma.$transaction([...criarPalavras, ...criarAuxiliares, ...criarTlds]);

    const palavrasChave = palavrasExistentes.length ? palavrasExistentes.map(item => item.termo) : gerados.palavrasChave;
    const palavrasAuxiliares = auxiliaresExistentes.length ? auxiliaresExistentes.map(item => item.termo) : gerados.palavrasAuxiliares;
    const tlds = tldsExistentes.length ? tldsExistentes.map(item => item.tld) : gerados.tlds;

    return { palavrasChave, palavrasAuxiliares, tlds, padrao: gerados };
};
