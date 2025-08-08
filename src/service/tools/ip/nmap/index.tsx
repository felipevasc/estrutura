import path from 'node:path';
import os from 'node:os';
import prisma from '@/database';
import { Terminal } from '@/service/terminal';
import Database from '@/database/Database';
import { TipoPorta } from '@/database/functions/porta';

export const executarNmap = async (idIp: string) => {
  const op = await prisma.ip.findFirst({
    where: { id: Number(idIp) }
  });
  const ip = op?.endereco ?? '';

  const nomeArquivoSaida = `nmap_${op?.projetoId}_${op?.id}_${ip}_${Date.now()}.txt`;
  const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

  const comando = 'nmap';
  const argumentos = ['-Pn', '-sV', ip];

  const resultado = await Terminal(comando, argumentos, caminhoSaida);

  const portas: TipoPorta[] = [];
  const linhas = resultado.saidaComando?.split('\n') ?? [];
  let parsing = false;
  for (const linha of linhas) {
    if (linha.startsWith('PORT')) {
      parsing = true;
      continue;
    }
    if (!parsing || linha.trim() === '') continue;
    const partes = linha.trim().split(/\s+/);
    if (partes.length >= 3) {
      const [portaProto, estado, servico, ...resto] = partes;
      const [numero, protocolo] = portaProto.split('/');
      portas.push({
        numero: Number(numero),
        protocolo,
        estado,
        servico: [servico, ...resto].join(' ').trim() || undefined,
      });
    }
  }

  await Database.limparPortas(op?.id ?? 0);
  await Database.adicionarPortas(portas, op?.id ?? 0);

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: resultado.saidaComando,
    treatedResult: portas,
  };
};

