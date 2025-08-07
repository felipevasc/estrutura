import prisma from '@/database';
import { Terminal } from '@/service/terminal';
import { Ip } from '@prisma/client';
import { parseStringPromise } from 'xml2js';

type NmapExecutionResult = {
  executedCommand: string;
  rawOutput: string;
  treatedResult: any;
};

export const executarNmap = async (idIp: number): Promise<NmapExecutionResult> => {
  const ip = await prisma.ip.findUnique({ where: { id: idIp } });
  if (!ip) {
    throw new Error('IP não encontrado.');
  }

  const comando = 'nmap';
  const argumentos = ['-sV', '-T4', '-Pn', '--open', '-oX', '-', ip.endereco];

  console.log(`[Serviço Nmap] Iniciando scan para ${ip.endereco}`);

  const resultado = await Terminal(comando, argumentos);
  const xmlOutput = resultado.saidaComando ?? "";

  const nmapScan = await prisma.nmapScan.create({
    data: {
      ipId: ip.id,
      rawOutput: xmlOutput,
    },
  });

  const parsedResult = await parseStringPromise(xmlOutput, { explicitArray: false, mergeAttrs: true });

  const ports = parsedResult?.nmaprun?.host?.ports?.port;
  const openPorts = [];

  if (ports && Array.isArray(ports)) {
    for (const port of ports) {
      const portInfo = {
        numero: parseInt(port.portid),
        protocolo: port.protocol,
        servico: port.service?.name,
        versao: port.service?.version,
        ipId: ip.id,
      };
      await prisma.porta.create({ data: portInfo });
      openPorts.push(portInfo);
    }
  } else if (ports) {
    const portInfo = {
      numero: parseInt(ports.portid),
      protocolo: ports.protocol,
      servico: ports.service?.name,
      versao: ports.service?.version,
      ipId: ip.id,
    };
    await prisma.porta.create({ data: portInfo });
    openPorts.push(portInfo);
  }

  console.log(`[Serviço Nmap] Scan para ${ip.endereco} concluído. Portas abertas: ${openPorts.length}`);

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: xmlOutput,
    treatedResult: {
      openPorts,
      nmapScanId: nmapScan.id,
    },
  };
};
