import prisma from '@/database';
import { Terminal } from '@/service/terminal';

type NiktoExecutionResult = {
  executedCommand: string;
  rawOutput: string;
  treatedResult: any;
};

export const executarNikto = async (idIp: number): Promise<NiktoExecutionResult> => {
  const ip = await prisma.ip.findUnique({
    where: { id: idIp },
    include: { portas: true },
  });

  if (!ip) {
    throw new Error('IP não encontrado.');
  }

  const webPorts = ip.portas.filter(p => ['http', 'https', 'http-proxy'].includes(p.servico || ''));

  if (webPorts.length === 0) {
    console.log(`[Serviço Nikto] Nenhum serviço web encontrado para ${ip.endereco}`);
    return {
      executedCommand: '',
      rawOutput: 'Nenhuma porta web encontrada.',
      treatedResult: {
        niktoScans: [],
      },
    };
  }

  let fullRawOutput = '';
  const niktoScans = [];

  for (const port of webPorts) {
    const protocol = (port.servico || '').includes('https') ? 'https' : 'http';
    const url = `${protocol}://${ip.endereco}:${port.numero}`;
    const comando = 'nikto';
    const argumentos = ['-h', url];

    console.log(`[Serviço Nikto] Analisando ${url}`);

    const resultado = await Terminal(comando, argumentos);
    const rawOutput = resultado.saidaComando ?? "";
    fullRawOutput += `\n--- Nikto para ${url} ---\n${rawOutput}`;

    const niktoScan = await prisma.niktoScan.create({
      data: {
        ipId: ip.id,
        rawOutput: rawOutput,
      },
    });
    niktoScans.push({ url, niktoScanId: niktoScan.id });
  }

  console.log(`[Serviço Nikto] Análise para ${ip.endereco} concluída.`);

  return {
    executedCommand: `nikto em ${webPorts.length} porta(s)`,
    rawOutput: fullRawOutput,
    treatedResult: {
      niktoScans,
    },
  };
};
