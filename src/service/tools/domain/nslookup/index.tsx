import path from 'node:path';
import os from 'node:os';
import { Terminal } from '@/service/terminal';
import prisma from '@/database';
import Database from '@/database/Database';
import { TipoIp } from '@/database/functions/ip';

export const executarNslookup = async (idDominio: string) => {
  const op = await prisma.dominio.findFirst({
    where: {
      id: Number(idDominio)
    }
  });
  const dominio = op?.endereco ?? "";


  const nomeArquivoSaida = `subfinder_resultado_${op?.projetoId}_${op?.id}_${dominio}_${Date.now()}.txt`;
  const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

  const comando = 'nslookup';
  const argumentos = ['-debug', dominio, "1.1.1.1"];

  console.log(`[Serviço nslookup] Iniciando processo para ${dominio}. Saída em: ${caminhoSaida}`);

  const resultado = await Terminal(comando, argumentos, caminhoSaida);

  const linhas = resultado.saidaComando?.split("\n").filter(s => !!s) ?? [];
  const ips: TipoIp[] = [];
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (linha.indexOf("internet address") < 0) {
      continue;
    }
    const tmp = linha.split("=")
    const ip = tmp?.[1]?.trim();
    if (ip) {
      ips.push({ endereco: ip, dominio: dominio });
    }
  }
  await Database.adicionarIp(ips, op?.projetoId ?? 0);

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: resultado.saidaComando,
    treatedResult: ips,
  };
};
