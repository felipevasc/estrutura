import fs from 'node:fs';
import path from 'node:path';

type RegistroComando = { comando: string; argumentos: string[] };

type MapaComandos = Record<string, RegistroComando>;

const pastaFerramentas = path.join(process.cwd(), 'src', 'service', 'nano', 'services', 'tools');
const pastaComandos = path.join(pastaFerramentas, 'comandos');
const pastaLogs = path.join(process.cwd(), 'logs', 'execucoes');

const garantirPasta = (diretorio: string) => {
  if (!fs.existsSync(diretorio)) fs.mkdirSync(diretorio, { recursive: true });
};

const carregarArquivo = (arquivo: string) => {
  if (!fs.existsSync(arquivo)) return {} as MapaComandos;
  try {
    const conteudo = fs.readFileSync(arquivo, 'utf8');
    return JSON.parse(conteudo) as MapaComandos;
  } catch {
    return {} as MapaComandos;
  }
};

export const registrarComandoFerramenta = (ferramenta: string, execucaoId: number, comando: string, argumentos: string[]) => {
  garantirPasta(pastaComandos);
  const arquivo = path.join(pastaComandos, `${ferramenta}.json`);
  const dados = carregarArquivo(arquivo);
  dados[`${execucaoId}`] = { comando, argumentos };
  fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
  const linha = `${comando} ${argumentos.join(' ')}`.trim();
  return linha.length ? linha : comando;
};

export const obterComandoRegistrado = (ferramenta: string, execucaoId: number) => {
  const arquivo = path.join(pastaComandos, `${ferramenta}.json`);
  const dados = carregarArquivo(arquivo);
  const registro = dados[`${execucaoId}`];
  if (!registro) return null;
  const linha = `${registro.comando} ${registro.argumentos.join(' ')}`.trim();
  return linha.length ? linha : registro.comando;
};

export const obterCaminhoLogExecucao = (execucaoId: number) => {
  garantirPasta(pastaLogs);
  return path.join(pastaLogs, `${execucaoId}.log`);
};

export const lerLogExecucao = (execucaoId: number) => {
  const caminho = obterCaminhoLogExecucao(execucaoId);
  if (!fs.existsSync(caminho)) return null;
  return fs.readFileSync(caminho, 'utf8');
};
