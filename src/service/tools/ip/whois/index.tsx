import prisma from '@/database';
import { Terminal } from '@/service/terminal';
import { Ip } from '@prisma/client';

type WhoisExecutionResult = {
  executedCommand: string;
  rawOutput: string;
  treatedResult: any;
};

export const executarWhois = async (idIp: number): Promise<WhoisExecutionResult> => {
  const ip = await prisma.ip.findUnique({ where: { id: idIp } });
  if (!ip) {
    throw new Error('IP não encontrado.');
  }

  const comando = 'whois';
  const argumentos = [ip.endereco];

  console.log(`[Serviço Whois] Iniciando consulta para ${ip.endereco}`);

  const resultado = await Terminal(comando, argumentos);
  const rawOutput = resultado.saidaComando ?? "";

  const whoisInfo = await prisma.whoisInfo.create({
    data: {
      ipId: ip.id,
      rawOutput: rawOutput,
    },
  });

  console.log(`[Serviço Whois] Consulta para ${ip.endereco} concluída.`);

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: rawOutput,
    treatedResult: {
      whoisInfoId: whoisInfo.id,
    },
  };
};
