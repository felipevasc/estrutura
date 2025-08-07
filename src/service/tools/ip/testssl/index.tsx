import prisma from '@/database';
import { Terminal } from '@/service/terminal';

type TestsslExecutionResult = {
  executedCommand: string;
  rawOutput: string;
  treatedResult: any;
};

export const executarTestssl = async (idIp: number): Promise<TestsslExecutionResult> => {
  const ip = await prisma.ip.findUnique({
    where: { id: idIp },
    include: { portas: true },
  });

  if (!ip) {
    throw new Error('IP não encontrado.');
  }

  const sslPorts = ip.portas.filter(p => (p.servico || '').includes('ssl') || (p.servico || '').includes('https'));

  if (sslPorts.length === 0) {
    console.log(`[Serviço Testssl] Nenhum serviço SSL/TLS encontrado para ${ip.endereco}`);
    return {
      executedCommand: '',
      rawOutput: 'Nenhuma porta SSL/TLS encontrada.',
      treatedResult: {
        testsslScans: [],
      },
    };
  }

  let fullRawOutput = '';
  const testsslScans = [];

  for (const port of sslPorts) {
    const target = `${ip.endereco}:${port.numero}`;
    const comando = 'testssl.sh';
    const argumentos = ['--quiet', target];

    console.log(`[Serviço Testssl] Analisando ${target}`);

    const resultado = await Terminal(comando, argumentos);
    const rawOutput = resultado.saidaComando ?? "";
    fullRawOutput += `\n--- Testssl.sh para ${target} ---\n${rawOutput}`;

    const testsslScan = await prisma.testsslScan.create({
      data: {
        ipId: ip.id,
        rawOutput: rawOutput,
      },
    });
    testsslScans.push({ target, testsslScanId: testsslScan.id });
  }

  console.log(`[Serviço Testssl] Análise para ${ip.endereco} concluída.`);

  return {
    executedCommand: `testssl.sh em ${sslPorts.length} porta(s)`,
    rawOutput: fullRawOutput,
    treatedResult: {
      testsslScans,
    },
  };
};
