import prisma from '@/database';
import { Terminal } from '@/service/terminal';

type Enum4linuxExecutionResult = {
  executedCommand: string;
  rawOutput: string;
  treatedResult: any;
};

export const executarEnum4linux = async (idIp: number): Promise<Enum4linuxExecutionResult> => {
  const ip = await prisma.ip.findUnique({
    where: { id: idIp },
    include: { portas: true },
  });

  if (!ip) {
    throw new Error('IP não encontrado.');
  }

  const smbPorts = ip.portas.filter(p => p.numero === 139 || p.numero === 445);

  if (smbPorts.length === 0) {
    console.log(`[Serviço Enum4linux] Nenhuma porta SMB encontrada para ${ip.endereco}`);
    return {
      executedCommand: '',
      rawOutput: 'Nenhuma porta SMB (139, 445) encontrada.',
      treatedResult: {},
    };
  }

  const comando = 'enum4linux-ng';
  const argumentos = ['-A', ip.endereco];

  console.log(`[Serviço Enum4linux] Analisando ${ip.endereco}`);

  const resultado = await Terminal(comando, argumentos);
  const rawOutput = resultado.saidaComando ?? "";

  const enum4linuxScan = await prisma.enum4linuxScan.create({
    data: {
      ipId: ip.id,
      rawOutput: rawOutput,
    },
  });

  console.log(`[Serviço Enum4linux] Análise para ${ip.endereco} concluída.`);

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: rawOutput,
    treatedResult: {
      enum4linuxScanId: enum4linuxScan.id,
    },
  };
};
