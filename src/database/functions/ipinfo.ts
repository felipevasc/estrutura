import prisma from "..";

export type TipoIpInfo = {
  tipo: string;
  chave?: string;
  valor: string;
};

export const adicionarIpInfos = async (infos: TipoIpInfo[], ipId: number) => {
  for (const info of infos) {
    await prisma.ipInfo.create({
      data: {
        tipo: info.tipo,
        chave: info.chave,
        valor: info.valor,
        ipId,
      }
    });
  }
};

export const limparIpInfos = async (tipo: string, ipId: number) => {
  await prisma.ipInfo.deleteMany({ where: { tipo, ipId } });
};

