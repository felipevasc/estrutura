import prisma from "..";

export type TipoPorta = {
  numero: number;
  protocolo?: string;
  servico?: string;
  estado?: string;
};

export const adicionarPortas = async (portas: TipoPorta[], ipId: number) => {
  const portasExistentes = await prisma.porta.findMany({
    where: { ipId }
  });

  for (const p of portas) {
    const existente = portasExistentes.find(pe => pe.numero === p.numero && pe.protocolo === p.protocolo);
    if (existente) {
      await prisma.porta.update({
        where: { id: existente.id },
        data: {
          servico: p.servico,
          estado: p.estado,
        }
      });
    } else {
      await prisma.porta.create({
        data: {
          numero: p.numero,
          protocolo: p.protocolo,
          servico: p.servico,
          estado: p.estado,
          ipId: ipId,
        }
      });
    }
  }
};

export const limparPortas = async (ipId: number) => {
  await prisma.porta.deleteMany({ where: { ipId } });
};

