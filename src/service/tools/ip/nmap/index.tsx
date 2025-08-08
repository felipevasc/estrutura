import prisma from '@/database';
import Database from '@/database/Database';
import { Terminal } from '@/service/terminal';
import { TipoPorta } from '@/database/functions/porta';
import os from 'os';
import path from 'path';

export const executarNmap = async (idIp: string) => {
  const op = await prisma.ip.findFirst({ where: { id: Number(idIp) } });
  const ip = op?.endereco ?? '';
  if (!ip) {
    throw new Error('IP inválido fornecido.');
  }

  const nomeArquivoSaida = `nmap_resultado_${op?.projetoId}_${op?.id}_${ip}_${Date.now()}.txt`;
  const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

  const comando = 'nmap';
  const argumentos = ['-Pn', ip, '2>&1'];

  const resultado = await Terminal(comando, argumentos, caminhoSaida);

  const portas: TipoPorta[] = [];
  resultado.saidaComando?.split('\n').forEach(linha => {
    const match = linha.match(/^(\d+)\/(tcp|udp)\s+(\w+)\s+([\w\-\.?]+)/);
    if (match) {
      portas.push({
        numero: Number(match[1]),
        protocolo: match[2],
        estado: match[3],
        servico: match[4]
      });
    }
  });

  await Database.adicionarPortas(portas, op?.id ?? 0);

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: resultado.saidaComando,
    treatedResult: portas,
  };
};
