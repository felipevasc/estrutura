import path from 'node:path';
import os from 'node:os';
import prisma from '@/database';
import { Terminal } from '@/service/terminal';
import Database from '@/database/Database';
import { TipoIpInfo } from '@/database/functions/ipinfo';

export const executarPing = async (idIp: string) => {
  const op = await prisma.ip.findFirst({ where: { id: Number(idIp) } });
  const ip = op?.endereco ?? '';

  const nomeArquivoSaida = `ping_${op?.projetoId}_${op?.id}_${ip}_${Date.now()}.txt`;
  const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

  const comando = 'ping';
  const argumentos = ['-c', '4', ip];

  const resultado = await Terminal(comando, argumentos, caminhoSaida);

  const infos: TipoIpInfo[] = [];
  const saida = resultado.saidaComando || '';

  const matchStats = saida.match(/(\d+) packets transmitted, (\d+) received, .*?, (\d+)% packet loss/);
  if (matchStats) {
    infos.push({ tipo: 'ping', chave: 'transmitted', valor: matchStats[1] });
    infos.push({ tipo: 'ping', chave: 'received', valor: matchStats[2] });
    infos.push({ tipo: 'ping', chave: 'packet_loss', valor: matchStats[3] });
  }
  const matchRtt = saida.match(/rtt min\/avg\/max\/\w+ = ([^\/]+)\/([^\/]+)\/([^\/]+)/);
  if (matchRtt) {
    infos.push({ tipo: 'ping', chave: 'rtt_min', valor: matchRtt[1] });
    infos.push({ tipo: 'ping', chave: 'rtt_avg', valor: matchRtt[2] });
    infos.push({ tipo: 'ping', chave: 'rtt_max', valor: matchRtt[3] });
  }

  await Database.limparIpInfos('ping', op?.id ?? 0);
  await Database.adicionarIpInfos(infos, op?.id ?? 0);

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: resultado.saidaComando,
    treatedResult: infos,
  };
};

