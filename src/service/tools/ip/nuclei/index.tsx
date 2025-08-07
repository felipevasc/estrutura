import prisma from '@/database';
import { Terminal } from '@/service/terminal';

type NucleiExecutionResult = {
  executedCommand: string;
  rawOutput: string;
  treatedResult: any;
};

export const executarNuclei = async (idIp: number): Promise<NucleiExecutionResult> => {
  const ip = await prisma.ip.findUnique({
    where: { id: idIp },
    include: { portas: true },
  });

  if (!ip) {
    throw new Error('IP não encontrado.');
  }

  const webPorts = ip.portas.filter(p => ['http', 'https', 'http-proxy'].includes(p.servico || ''));

  if (webPorts.length === 0) {
    console.log(`[Serviço Nuclei] Nenhum serviço web encontrado para ${ip.endereco}`);
    return {
      executedCommand: '',
      rawOutput: 'Nenhuma porta web encontrada.',
      treatedResult: {
        nucleiScans: [],
      },
    };
  }

  let fullRawOutput = '';
  const nucleiScans = [];

  for (const port of webPorts) {
    const protocol = (port.servico || '').includes('https') ? 'https' : 'http';
    const url = `${protocol}://${ip.endereco}:${port.numero}`;
    const comando = 'nuclei';
    const argumentos = ['-u', url, '-silent'];

    console.log(`[Serviço Nuclei] Analisando ${url}`);

    const resultado = await Terminal(comando, argumentos);
    const rawOutput = resultado.saidaComando ?? "";
    fullRawOutput += `\n--- Nuclei para ${url} ---\n${rawOutput}`;

    const nucleiScan = await prisma.nucleiScan.create({
      data: {
        ipId: ip.id,
        rawOutput: rawOutput,
      },
    });
    nucleiScans.push({ url, nucleiScanId: nucleiScan.id });
  }

  console.log(`[Serviço Nuclei] Análise para ${ip.endereco} concluída.`);

  return {
    executedCommand: `nuclei em ${webPorts.length} porta(s)`,
    rawOutput: fullRawOutput,
    treatedResult: {
      nucleiScans,
    },
  };
};
