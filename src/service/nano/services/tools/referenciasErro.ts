import https from 'node:https';

type Medicao = { status: number; tamanho: number };

export type ReferenciaErro = {
  tamanhosVariam: boolean;
  statusVariam: boolean;
  status: number[];
  pares: Medicao[];
};

const caminhosErro = ['essapaginaehdeerro', 'essapaginaehdeerro2', 'essapaginaehdeerro03', 'essapaginaehdeerro004', 'essapaginaehdeerro0005'];

const agenteInseguro = new https.Agent({ rejectUnauthorized: false });

const normalizarUrl = (base: string, caminho: string) => {
  const alvo = base.endsWith('/') ? base.slice(0, -1) : base;
  const sufixo = caminho.startsWith('/') ? caminho.slice(1) : caminho;
  const marcador = `${Date.now()}${Math.random().toString(16).slice(2)}`;
  return `${alvo}/${sufixo}?ref=${marcador}`;
};

const medirResposta = async (url: string): Promise<Medicao | null> => {
  try {
    const resposta = await fetch(url, { agent: agenteInseguro });
    const corpo = await resposta.text();
    const tamanho = Buffer.byteLength(corpo);
    return { status: resposta.status, tamanho };
  } catch {
    return null;
  }
};

export const coletarReferenciasErro = async (alvo: string): Promise<ReferenciaErro | null> => {
  const resultados: Medicao[] = [];

  for (const caminho of caminhosErro) {
    const url = normalizarUrl(alvo, caminho);
    const medicao = await medirResposta(url);
    if (medicao) resultados.push(medicao);
  }

  if (!resultados.length) return null;

  const tamanhos = new Set(resultados.map((resultado) => resultado.tamanho));
  const tamanhosVariam = tamanhos.size > 1;
  const statusSet = new Set(resultados.map((resultado) => resultado.status));
  const status = Array.from(statusSet);
  const statusVariam = statusSet.size > 1;

  return { tamanhosVariam, statusVariam, status, pares: resultados };
};

export const filtrarResultadosErro = <T extends { status: number | null; tamanho: number | null }>(
  resultados: T[],
  referencia: ReferenciaErro | null
) => {
  if (!referencia) return resultados;

  if (!referencia.tamanhosVariam && !referencia.statusVariam) {
    const paresIgnorados = new Set(referencia.pares.map((par) => `${par.status}|${par.tamanho}`));
    return resultados.filter((resultado) => {
      if (resultado.status === null || resultado.tamanho === null) return true;
      return !paresIgnorados.has(`${resultado.status}|${resultado.tamanho}`);
    });
  }

  if (referencia.tamanhosVariam && !referencia.statusVariam) {
    const statusIgnorados = new Set(referencia.status);
    return resultados.filter((resultado) => resultado.status === null || !statusIgnorados.has(resultado.status));
  }

  if (referencia.statusVariam) {
    const statusIgnorados = new Set(referencia.status);
    return resultados.filter((resultado) => resultado.status === null || !statusIgnorados.has(resultado.status));
  }

  return resultados;
};
