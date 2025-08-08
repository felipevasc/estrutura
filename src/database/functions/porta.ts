import prisma from "..";

export type TipoPorta = {
  numero: number;
  protocolo: string;
  estado: string;
  servico?: string;
};

export const adicionarPortas = async (portas: TipoPorta[], ipId: number) => {
  const ip = await prisma.ip.findFirst({
    where: { id: ipId },
    include: { portas: true },
  });
  if (!ip) return;

  for (const porta of portas) {
    const existente = ip.portas.find(
      (p) => p.numero === porta.numero && p.protocolo === porta.protocolo
    );
    if (!existente) {
      await prisma.porta.create({
        data: {
          numero: porta.numero,
          protocolo: porta.protocolo,
          estado: porta.estado,
          servico: porta.servico,
          ipId,
        },
      });
    } else {
      await prisma.porta.update({
        where: { id: existente.id },
        data: { estado: porta.estado, servico: porta.servico },
      });
    }
  }
};
