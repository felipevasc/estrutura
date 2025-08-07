import prisma from '@/database';
import { Terminal } from '@/service/terminal';
import { Ip } from '@prisma/client';

type DnsreconExecutionResult = {
  executedCommand: string;
  rawOutput: string;
  treatedResult: any;
};

export const executarDnsrecon = async (idIp: number): Promise<DnsreconExecutionResult> => {
  const ip = await prisma.ip.findUnique({
    where: { id: idIp },
    include: { dominios: true },
  });

  if (!ip) {
    throw new Error('IP não encontrado.');
  }

  const domain = ip.dominios[0]?.endereco;

  if(!domain){
    throw new Error('Dominio não encontrado.');
  }

  const comando = 'dnsrecon';
  const argumentos = ['-d', domain, '-n', ip.endereco];

  console.log(`[Serviço Dnsrecon] Iniciando scan para ${ip.endereco} no dominio ${domain}`);

  const resultado = await Terminal(comando, argumentos);
  const rawOutput = resultado.saidaComando ?? "";

  const dnsreconScan = await prisma.dnsreconScan.create({
    data: {
      ipId: ip.id,
      rawOutput: rawOutput,
    },
  });

  console.log(`[Serviço Dnsrecon] Scan para ${ip.endereco} concluído.`);

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: rawOutput,
    treatedResult: {
      dnsreconScanId: dnsreconScan.id,
    },
  };
};
