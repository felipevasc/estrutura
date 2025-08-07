import path from 'node:path';
import os from 'node:os';
import { Terminal } from '@/service/terminal';
import prisma from '@/database';
import Database from '@/database/Database';

export const executarSubfinder = async (idDominio: string) => {
  const op = await prisma.dominio.findFirst({
    where: {
      id: Number(idDominio)
    }
  });
  const dominio = op?.endereco ?? "";


  const nomeArquivoSaida = `subfinder_resultado_${op?.projetoId}_${op?.id}_${dominio}_${Date.now()}.txt`;
  const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

  const comando = 'subfinder';
  const argumentos = ['-d', dominio, "--all", "-silent"];

  console.log(`[Serviço subfinder] Iniciando processo para ${dominio}. Saída em: ${caminhoSaida}`);

  const resultado = await Terminal(comando, argumentos, caminhoSaida);

  const subdominios = resultado.saidaComando?.split("\n").filter(s => !!s) ?? [];

  await Database.adicionarSubdominio(subdominios, op?.projetoId ?? 0);

  return subdominios;
};
