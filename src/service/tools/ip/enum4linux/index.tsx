import path from 'node:path';
import os from 'node:os';
import prisma from '@/database';
import Database from '@/database/Database';
import { Terminal } from '@/service/terminal';
import { TipoUsuario } from '@/database/functions/usuario';

export const executarEnum4linux = async (idIp: string) => {
  const ip = await prisma.ip.findFirst({
    where: {
      id: Number(idIp)
    }
  });
  const enderecoIp = ip?.endereco ?? "";

  const nomeArquivoSaida = `enum4linux_resultado_${ip?.projetoId}_${ip?.id}_${enderecoIp}_${Date.now()}.txt`;
  const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

  const comando = 'enum4linux';
  const argumentos = ['-U', '-r', enderecoIp];

  const resultado = await Terminal(comando, argumentos, caminhoSaida);

  const linhas = resultado.saidaComando?.split("\n") ?? [];
  const usuarios: TipoUsuario[] = [];
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    let match = linha.match(/user:\[([^\[]*)\]/i);
    if (match?.[1]) {
      usuarios.push({ nome: match[1] });
    }
    match = linha.match(/.*\\(.*) \(Local User\)/i);
    if (match?.[1]) {
      usuarios.push({ nome: match[1] });
    }
  }
  await Database.adicionarUsuarios(usuarios, Number(idIp));

  return {
    executedCommand: `${comando} ${argumentos.join(' ')}`,
    rawOutput: resultado.saidaComando,
    treatedResult: usuarios,
  };
};
