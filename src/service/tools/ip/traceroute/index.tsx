import path from 'node:path';
import os from 'node:os';
import prisma from '@/database';
import { Terminal } from '@/service/terminal';
import Database from '@/database/Database';
import { TipoIpInfo } from '@/database/functions/ipinfo';

export const executarTraceroute = async (idIp: string) => {
  const op = await prisma.ip.findFirst({ where: { id: Number(idIp) } });
  const ip = op?.endereco ?? '';

  const nomeArquivoSaida = `traceroute_${op?.projetoId}_${op?.id}_${ip}_${Date.now()}.txt`;
  const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

  const comando = 'traceroute';
  const argumentos = ['-n', ip];

  const resultado = await Terminal(comando, argumentos, caminhoSaida);

  const hops: string[] = [];
  const linhas = resultado.saidaComando?.split('\n') ?? [];
  for (const linha of linhas) {
    const match = linha.trim().match(/^\s*\d+\s+([0-9.]+)/);
    if (match) {
      hops.push(match[1]);
    }
  }

  const infos: TipoIpInfo[] = [
    { tipo: 'traceroute', chave: 'hops', valor: JSON.stringify(hops) }
  ];

  await Database.limparIpInfos('traceroute', op?.id ?? 0);
  await Database.adicionarIpInfos(infos, op?.id ?? 0);

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: resultado.saidaComando,
    treatedResult: hops,
  };
};

