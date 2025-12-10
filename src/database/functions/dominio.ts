import prisma from "..";
import { TipoDominio } from "@prisma/client";

export async function adicionarSubdominio(subdominios: string[], projetoId: number, tipo: TipoDominio = TipoDominio.dns, paiPadraoId?: number) {
  const uniqueSubs = [...new Set(subdominios)].filter(s => s && s.trim().length > 0);
  if (uniqueSubs.length === 0) return;

  const prioridadeTipo = (valor: TipoDominio) => {
    if (valor === TipoDominio.mail) return 3;
    if (valor === TipoDominio.dns) return 2;
    return 1;
  };

  const dominiosExistentes = await prisma.dominio.findMany({
    where: {
      projetoId: projetoId,
    }
  });

  const todosDominios = [...dominiosExistentes];

  const selecionarPai = (s: string, ignorarId?: number) => {
    let melhorPai = null as any;
    let maxLen = -1;
    for (const candidato of todosDominios) {
      if (candidato.id === ignorarId) continue;
      if (s.endsWith("." + candidato.endereco)) {
        if (candidato.endereco.length > maxLen) {
          maxLen = candidato.endereco.length;
          melhorPai = candidato;
        }
      }
    }
    if (!melhorPai && paiPadraoId) melhorPai = todosDominios.find(d => d.id === paiPadraoId) || null;
    return melhorPai;
  };

  uniqueSubs.sort((a, b) => a.length - b.length);

  for (const s of uniqueSubs) {
    const existente = todosDominios.find(d => d.endereco === s);
    const pai = selecionarPai(s, existente?.id);
    if (existente) {
      const deveAtualizarTipo = prioridadeTipo(tipo) > prioridadeTipo(existente.tipo);
      const deveAtualizarPai = pai && existente.paiId !== pai.id;
      if (!deveAtualizarTipo && !deveAtualizarPai) continue;
      const data: any = {};
      if (deveAtualizarTipo) data.tipo = tipo;
      if (deveAtualizarPai) data.paiId = pai.id;
      const atualizado = await prisma.dominio.update({ where: { id: existente.id }, data });
      const indice = todosDominios.findIndex(d => d.id === existente.id);
      if (indice >= 0) todosDominios[indice] = atualizado;
      continue;
    }

    try {
      const novoDominio = await prisma.dominio.create({
        data: {
          endereco: s,
          projetoId: projetoId,
          paiId: pai?.id ?? null,
          tipo: tipo,
        }
      });
      todosDominios.push(novoDominio);
    } catch (e) {
      console.error(`Erro ao criar domínio ${s}:`, e);
    }
  }
}
