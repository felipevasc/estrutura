import prisma from '@/database';
import { Terminal } from '@/service/terminal';

type FeroxbusterExecutionResult = {
  executedCommand: string;
  rawOutput: string;
  treatedResult: any;
};

export const executarFeroxbuster = async (idIp: number): Promise<FeroxbusterExecutionResult> => {
  const ip = await prisma.ip.findUnique({
    where: { id: idIp },
    include: { portas: true },
  });

  if (!ip) {
    throw new Error('IP não encontrado.');
  }

  const webPorts = ip.portas.filter(p => ['http', 'https', 'http-proxy'].includes(p.servico || ''));

  if (webPorts.length === 0) {
    console.log(`[Serviço Feroxbuster] Nenhum serviço web encontrado para ${ip.endereco}`);
    return {
      executedCommand: '',
      rawOutput: 'Nenhuma porta web encontrada.',
      treatedResult: {
        feroxbusterScans: [],
      },
    };
  }

  let fullRawOutput = '';
  const feroxbusterScans = [];
  const wordlist = '/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt';

  for (const port of webPorts) {
    const protocol = (port.servico || '').includes('https') ? 'https' : 'http';
    const url = `${protocol}://${ip.endereco}:${port.numero}`;
    const comando = 'feroxbuster';
    const argumentos = ['-u', url, '-w', wordlist, '-t', '1'];

    console.log(`[Serviço Feroxbuster] Analisando ${url}`);

    const resultado = await Terminal(comando, argumentos);
    const rawOutput = resultado.saidaComando ?? "";
    fullRawOutput += `\n--- Feroxbuster para ${url} ---\n${rawOutput}`;

    const feroxbusterScan = await prisma.feroxbusterScan.create({
      data: {
        ipId: ip.id,
        rawOutput: rawOutput,
      },
    });
    feroxbusterScans.push({ url, feroxbusterScanId: feroxbusterScan.id });
  }

  console.log(`[Serviço Feroxbuster] Análise para ${ip.endereco} concluída.`);

  return {
    executedCommand: `feroxbuster em ${webPorts.length} porta(s)`,
    rawOutput: fullRawOutput,
    treatedResult: {
      feroxbusterScans,
    },
  };
};
