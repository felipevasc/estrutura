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
  // 1. Pre-fetch existing IPs and Domains for this project to minimize DB queries
  const [ipsExistentes, dominiosExistentes] = await Promise.all([
    prisma.ip.findMany({
      where: { projetoId: projetoId },
      include: { dominios: true }
    }),
    prisma.dominio.findMany({
      where: { projetoId: projetoId }
    })
  ]);

  const dominiosMap = new Map(dominiosExistentes.map(d => [d.endereco, d]));
  // Map of IP Address -> IP Object
  const ipsMap = new Map(ipsExistentes.map(i => [i.endereco, i]));

  for (const ipData of ips) {
    const { endereco, dominio } = ipData;
    const dominioObj = dominiosMap.get(dominio);

    // If domain doesn't exist, we can't link it (or we should create it, but logic assumes it exists from amass/subfinder)
    if (!dominioObj) continue;

    let ipObj = ipsMap.get(endereco);

    if (!ipObj) {
      // Create new IP
      try {
        ipObj = await prisma.ip.create({
            data: {
              endereco: endereco,
              projetoId: projetoId,
              dominios: {
                connect: { id: dominioObj.id }
              }
            },
            include: { dominios: true }
          });
          // Update cache
          ipsMap.set(endereco, ipObj);
      } catch (e) {
          console.error(`Error creating IP ${endereco}`, e);
      }
    } else {
      // Update existing IP if not already linked
      const isLinked = ipObj.dominios.some(d => d.id === dominioObj.id);
      if (!isLinked) {
         try {
             await prisma.ip.update({
                where: { id: ipObj.id },
                data: {
                    dominios: {
                        connect: { id: dominioObj.id }
                    }
                }
             });
             // Update local cache (optional but good for consistency in loop)
             ipObj.dominios.push(dominioObj);
         } catch (e) {
             console.error(`Error updating IP ${endereco}`, e);
         }
      }
    }
  }
}

export const adicionarPortas = async (portas: TipoPorta[], ipId: number) => {
  const portasExistentes = await prisma.porta.findMany({
    where: { ipId: ipId },
  });

  const existingPortsMap = new Map(portasExistentes.map(p => [p.numero, p]));

  // Filter unique ports from input to avoid duplicates in the input list
  const uniqueInputPorts = portas.filter((p, index, self) =>
    index === self.findIndex((t) => (
      t.porta === p.porta
    ))
  );

  const newPorts = [];

  for (const p of uniqueInputPorts) {
      if (!existingPortsMap.has(p.porta)) {
          newPorts.push({
              numero: p.porta,
              protocolo: p.protocolo ?? "",
              servico: p.servico ?? "",
              versao: p.versao ?? "",
              ipId: ipId
          });
      }
  }

  if (newPorts.length > 0) {
      await prisma.porta.createMany({
          data: newPorts
      });
  }
}
