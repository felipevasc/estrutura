import prisma from '@/database';
import { Terminal } from '@/service/terminal';

type WhatWebExecutionResult = {
  executedCommand: string;
  rawOutput: string;
  treatedResult: any;
};

export const executarWhatWeb = async (idIp: number): Promise<WhatWebExecutionResult> => {
  const ip = await prisma.ip.findUnique({
    where: { id: idIp },
    include: { portas: true },
  });

  if (!ip) {
    throw new Error('IP não encontrado.');
  }

  const webPorts = ip.portas.filter(p => ['http', 'https', 'http-proxy'].includes(p.servico || ''));

  if (webPorts.length === 0) {
    console.log(`[Serviço WhatWeb] Nenhum serviço web encontrado para ${ip.endereco}`);
    return {
      executedCommand: '',
      rawOutput: 'Nenhuma porta web encontrada.',
      treatedResult: {
        whatWebResults: [],
      },
    };
  }

  let fullRawOutput = '';
  const whatWebResults = [];

  for (const port of webPorts) {
    const protocol = (port.servico || '').includes('https') ? 'https' : 'http';
    const url = `${protocol}://${ip.endereco}:${port.numero}`;
    const comando = 'whatweb';
    const argumentos = ['--no-error', url];

    console.log(`[Serviço WhatWeb] Analisando ${url}`);

    const resultado = await Terminal(comando, argumentos);
    const rawOutput = resultado.saidaComando ?? "";
    fullRawOutput += `\n--- WhatWeb para ${url} ---\n${rawOutput}`;

    const whatWebResult = await prisma.whatWebResult.create({
      data: {
        ipId: ip.id,
        rawOutput: rawOutput,
      },
    });
    whatWebResults.push({ url, whatWebResultId: whatWebResult.id });
  }

  console.log(`[Serviço WhatWeb] Análise para ${ip.endereco} concluída.`);

  return {
    executedCommand: `whatweb em ${webPorts.length} porta(s)`,
    rawOutput: fullRawOutput,
    treatedResult: {
      whatWebResults,
    },
  };
};
