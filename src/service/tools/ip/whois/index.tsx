import path from 'node:path';
import os from 'node:os';
import prisma from '@/database';
import { Terminal } from '@/service/terminal';
import Database from '@/database/Database';
import { TipoIpInfo } from '@/database/functions/ipinfo';

export const executarWhois = async (idIp: string) => {
  const op = await prisma.ip.findFirst({ where: { id: Number(idIp) } });
  const ip = op?.endereco ?? '';

  const nomeArquivoSaida = `whois_${op?.projetoId}_${op?.id}_${ip}_${Date.now()}.txt`;
  const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

  const comando = 'whois';
  const argumentos = [ip];

  const resultado = await Terminal(comando, argumentos, caminhoSaida);

  const infos: TipoIpInfo[] = [];
  const linhas = resultado.saidaComando?.split('\n') ?? [];
  const chavesDesejadas = ['OrgName', 'Organization', 'Country', 'NetName', 'OrgId'];
  for (const linha of linhas) {
    const tmp = linha.split(':');
    if (tmp.length >= 2) {
      const chave = tmp[0].trim();
      const valor = tmp.slice(1).join(':').trim();
      if (chavesDesejadas.includes(chave)) {
        infos.push({ tipo: 'whois', chave, valor });
      }
    }
  }

  await Database.limparIpInfos('whois', op?.id ?? 0);
  await Database.adicionarIpInfos(infos, op?.id ?? 0);

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: resultado.saidaComando,
    treatedResult: infos,
  };
};

