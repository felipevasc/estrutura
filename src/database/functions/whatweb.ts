import { Prisma } from "@prisma/client";
import prisma from "..";

export type ResultadoWhatweb = {
  plugin: string;
  valor: string;
  dados?: unknown;
  dominioId?: number | null;
  ipId?: number | null;
  diretorioId?: number | null;
};

const gerarAssinatura = (resultado: ResultadoWhatweb) => `${resultado.plugin}|${resultado.valor}|${resultado.dominioId ?? ''}|${resultado.ipId ?? ''}|${resultado.diretorioId ?? ''}`;

const normalizarResultado = (resultado: ResultadoWhatweb) => ({
  ...resultado,
  dominioId: resultado.dominioId ?? null,
  ipId: resultado.ipId ?? null,
  diretorioId: resultado.diretorioId ?? null
});

export const criarResultadosWhatweb = async (resultados: ResultadoWhatweb[]) => {
  const normalizados = resultados.map(normalizarResultado).filter((resultado) => resultado.plugin && resultado.valor);
  const mapa = new Map<string, ResultadoWhatweb>();

  normalizados.forEach((resultado) => {
    const assinatura = gerarAssinatura(resultado);
    if (!mapa.has(assinatura)) mapa.set(assinatura, resultado);
  });

  if (!mapa.size) return [];

  const assinaturas = Array.from(mapa.keys());
  const existentes = await prisma.whatwebResultado.findMany({ where: { assinatura: { in: assinaturas } } });
  const assinaturasExistentes = new Set(existentes.map((resultado) => resultado.assinatura));

  const novos = assinaturas
    .filter((assinatura) => !assinaturasExistentes.has(assinatura))
    .map((assinatura) => mapa.get(assinatura))
    .filter((resultado): resultado is ResultadoWhatweb => Boolean(resultado));

  if (novos.length) {
    await prisma.whatwebResultado.createMany({
      data: novos.map((resultado) => ({
        assinatura: gerarAssinatura(resultado),
        plugin: resultado.plugin,
        valor: resultado.valor,
        dados: resultado.dados as Prisma.InputJsonValue,
        dominioId: resultado.dominioId,
        ipId: resultado.ipId,
        diretorioId: resultado.diretorioId
      }))
    });
  }

  return prisma.whatwebResultado.findMany({ where: { assinatura: { in: assinaturas } } });
};
