import prisma from "..";

export type TipoIp = {
  endereco: string;
  dominio: string;
}

export const adicionarIp = async (ips: TipoIp[], projetoId: number) => {
  const ipsExistentes = await prisma.ip.findMany({
    where: {
      projetoId: projetoId,
    },
    include: {
      dominios: true
    }
  });
  for (let i = 0; i < ips.length; i++) {
    const ip = ips[i].endereco;
    const dominio = ips[i].dominio
    let ipAtual = ipsExistentes.find(i => i.endereco === ip)
    const dominioAtual = await prisma.dominio.findFirst({
      where: {
        endereco: dominio,
        projetoId: projetoId,
      }
    });
    if (dominioAtual?.id) {
      if (!ipAtual?.id) {
        ipAtual = await prisma.ip.create({
          data: {
            endereco: ip,
            projetoId: projetoId,
            dominios: {
              connect: {
                id: dominioAtual.id,
              }
            }
          },
          include: {
            dominios: true
          }
        });
      } else {
        if (!ipAtual.dominios.find(d => d.id === dominioAtual.id)?.id) {
          await prisma.ip.update({
            where: {
              id: ipAtual.id,
            },
            data: {
              dominios: {
                connect: {
                  id: dominioAtual.id,
                }
              }
            }
          });
        }
      }
    }
  }
}