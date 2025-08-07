import prisma from "..";

export async function adicionarSubdominio(subdominios: string[], projetoId: number) {
  const dominiosExistentes = await prisma.dominio.findMany({
    where: {
      projetoId: projetoId,
    }
  });
  for (let i = 0; i < subdominios.length; i++) {
    const s = subdominios[i];
    const pai = dominiosExistentes?.find(de => s.indexOf(de.endereco) > -1);
    if (!dominiosExistentes.find(d => d.endereco === s)?.id) {
      const r = await prisma.dominio.create({
        data: {
          endereco: s,
          projetoId: projetoId,
          paiId: pai?.id ?? null,
        }
      });
      dominiosExistentes.push(r);
    }
  }
}