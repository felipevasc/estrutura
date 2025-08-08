import path from 'node:path';
import os from 'node:os';
import { Terminal } from '@/service/terminal';
import prisma from '@/database';
import Database from '@/database/Database';
import { TipoIp, TipoPorta } from '@/database/functions/ip';

export const executarNmap = async (idIp: string) => {
  const op = await prisma.ip.findFirst({
    where: {
      id: Number(idIp)
    }
  });
  const enderecoIp = op?.endereco ?? "";


  const nomeArquivoSaida = `nmap_resultado_${op?.projetoId}_${op?.id}_${enderecoIp}_${Date.now()}.txt`;
  const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

  const comando = 'nmap';
  const argumentos = ['-Pn', enderecoIp, "-p", "1-9999"];

  const resultado = await Terminal(comando, argumentos, caminhoSaida);

  const linhas = resultado.saidaComando?.split("\n").filter(s => !!s) ?? [];
  const portas: TipoPorta[] = [];
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (linha.indexOf("open") < 0) {
      continue;
    }
    const tmp = linha.replace(/\t/g, " ").replace(/\s+/g, " ").split(" ")
    const tmp2 = tmp?.[0]?.trim()?.split("/");
    const porta = tmp2?.[0]?.trim();
    const protocolo = tmp2?.[1]?.trim();
    const servico = tmp?.[2]?.trim();
    if (porta) {
      portas.push({ porta: Number(porta), servico, versao: "", protocolo });
    }
  }
  await Database.adicionarPortas(portas, Number(idIp));

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: resultado.saidaComando,
    treatedResult: portas,
  };
};
