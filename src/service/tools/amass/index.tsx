import path from 'node:path';
import os from 'node:os';
import { Terminal } from '@/service/terminal';
import prisma from '@/database';

const validarDominio = (dominio: string): boolean => {
  const regexDominio = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
  return regexDominio.test(dominio);
};

export const iniciarEnumeracaoAmass = async (idDominio: string) => {
  const op = await prisma.dominio.findFirst({
    where: {
      id: Number(idDominio)
    }
  });
  const dominio = op?.endereco ?? "";

  if (op?.endereco) {
  }
  if (!validarDominio(dominio)) {
    throw new Error('Domínio inválido ou inseguro fornecido.');
  }


  const nomeArquivoSaida = `amass_resultado_${op?.projetoId}_${op?.id}_${dominio}_${Date.now()}.txt`;
  const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

  const comando = 'amass';
  const argumentos = ['enum', '-d', dominio, '-timeout', "2", "2>&1"];

  console.log(`[Serviço Amass] Iniciando processo para ${dominio}. Saída em: ${caminhoSaida}`);

  const resultado = await Terminal(comando, argumentos, caminhoSaida);
  const subdominios: string[] = [];
  const redes: string[] = [];
  const ips: string[] = [];

  const addElemento = (elemento: string, tipo: string) => {
    if (tipo === "FQDN") {
      subdominios.push(elemento);
    } else if (tipo === "IPAddress") {
      ips.push(elemento);
    } else if (tipo === "Netblock") {
      redes.push(elemento);
    }
  }

  resultado.saidaComando?.split("\n").forEach((linha) => {
    const colunas = linha.split(" --> ");
    if (colunas.length === 3) {
      const tmp0 = colunas[0]?.trim()?.replaceAll(")", "").split("(");
      const ativoOrigem = tmp0[0].trim();
      const tipoAtivoOrigem = tmp0[1];

      const tmp1 = colunas[2].trim().replaceAll(")", "").split("(");
      console.warn(tmp0, tmp1)
      const ativoDestino = tmp1[0].trim();
      const tipoAtivoDestino = tmp1[1].trim();

      const relacao = colunas[1].trim();

      if (ativoOrigem.indexOf(dominio) > -1 || ativoDestino.indexOf(dominio) > -1) {
        addElemento(ativoOrigem, tipoAtivoOrigem);
        addElemento(ativoDestino, tipoAtivoDestino);
      }
    }
  });
  const tmp = {
    subdominios: subdominios.filter((i, idx) => idx === subdominios.findIndex((item) => item === i)).sort((a, b) => a.split(".").reverse().join(".") > b.split(".").reverse().join(".") ? 1 : -1),
    ips: ips.filter((i, idx) => idx === ips.findIndex((item) => item === i)).sort(),
    redes: redes.filter((i, idx) => idx === redes.findIndex((item) => item === i)).sort(),
  }

  for (let i = 0; i < tmp.subdominios.length; i++) {
    const s = tmp.subdominios[i];
    const dominiosExistentes = await prisma.dominio.findMany({
      where: {
        projetoId: Number(op?.projetoId),
      }
    });
    const pai = dominiosExistentes?.find(de => s.indexOf(de.endereco) > -1);
    if (!dominiosExistentes.find(d => d.endereco === s)?.id) {
      const r = await prisma.dominio.create({
        data: {
          endereco: s,
          projetoId: Number(op?.projetoId),
          paiId: pai?.id ?? null,
        }
      });
    }
  }
  
  return tmp;
};