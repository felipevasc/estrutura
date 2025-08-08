import prisma from "..";

export type TipoIp = {
  endereco: string;
  dominio: string;
}

export type TipoPorta = {
  porta: number;
  protocolo?: string;
  servico?: string;
  versao?: string;
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
    console.log("Adicionando IP", ip, ipAtual, dominioAtual)
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

export const adicionarPortas = async (portas: TipoPorta[], ipId: number) => {
  const portasExistentes = await prisma.porta.findMany({
    where: {
      ipId: ipId
    },
  });
  for (let i = 0; i < portas.length; i++) {
    const porta = portas[i].porta;
    const protocolo = portas[i].protocolo;
    const servico = portas[i].servico;
    const versao = portas[i].versao;
    let portaAtual = portasExistentes.find(p => p.numero === porta)
    console.log("PORTA", portaAtual, porta, servico, versao, ipId)
    if (!portaAtual?.id && porta) {
      portaAtual = await prisma.porta.create({
        data: {
          numero: porta,
          protocolo: protocolo ?? "",
          servico: servico ?? "",
          versao: versao ?? "",
          ipId: ipId
        },
      });
    }
  }
}