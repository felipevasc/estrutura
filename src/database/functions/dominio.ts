import prisma from "..";
import { TipoDominio } from "@prisma/client";

export async function adicionarSubdominio(subdominios: string[], projetoId: number, tipo: TipoDominio = TipoDominio.dns) {
  const uniqueSubs = [...new Set(subdominios)].filter(s => s && s.trim().length > 0);
  if (uniqueSubs.length === 0) return;

  const dominiosExistentes = await prisma.dominio.findMany({
    where: {
      projetoId: projetoId,
    }
  });

  const todosDominios = [...dominiosExistentes];

  uniqueSubs.sort((a, b) => a.length - b.length);

  for (const s of uniqueSubs) {
    if (todosDominios.some(d => d.endereco === s)) {
      continue;
    }

    let melhorPai = null as any;
    let maxLen = -1;

    for (const candidato of todosDominios) {
      if (s.endsWith("." + candidato.endereco)) {
        if (candidato.endereco.length > maxLen) {
          maxLen = candidato.endereco.length;
          melhorPai = candidato;
        }
      }
    }

    try {
      const novoDominio = await prisma.dominio.create({
        data: {
          endereco: s,
          projetoId: projetoId,
          paiId: melhorPai?.id ?? null,
          tipo: tipo,
        }
      });
      todosDominios.push(novoDominio);
    } catch (e) {
      console.error(`Erro ao criar domínio ${s}:`, e);
    }
  }
}
