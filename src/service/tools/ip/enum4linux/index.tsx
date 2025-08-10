import path from 'node:path';
import os from 'node:os';
import { Terminal } from '@/service/terminal';
import prisma from '@/database';
import Database from '@/database/Database';

export const executarEnum4linux = async (idIp: string) => {
  const ip = await prisma.ip.findFirst({
    where: {
      id: Number(idIp)
    }
  });
  const enderecoIp = ip?.endereco ?? "";
  const projetoId = ip?.projetoId;

  if (!projetoId) {
    throw new Error("IP não associado a um projeto.");
  }

  const nomeArquivoSaida = `enum4linux_resultado_${ip?.projetoId}_${ip?.id}_${enderecoIp}_${Date.now()}.txt`;
  const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

  const comando = 'enum4linux';
  const argumentos = ['-U', enderecoIp];

  const resultado = await Terminal(comando, argumentos, caminhoSaida);

  const linhas = resultado.saidaComando?.split("\n").filter(s => !!s) ?? [];
  const usuarios: string[] = [];
  const userRegex = /user:\[(.*)\] rid:/;

  for (const linha of linhas) {
    if (linha.includes("user:")) {
        const match = linha.match(userRegex);
        if(match && match[1]){
            usuarios.push(match[1]);
        }
    }
  }

  await Database.adicionarUsuarios(usuarios, projetoId);

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: resultado.saidaComando,
    treatedResult: usuarios,
  };
};
