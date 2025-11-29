import { NanoService } from '../../NanoService';
import prisma from '@/database';
import fs from 'fs';
import path from 'node:path';
import os from 'node:os';
import { NanoEvents } from '../../events';
import { AlvoResolvido, resolverAlvo } from './resolvedorAlvo';
import { coletarReferenciasErro, filtrarResultadosErro, ReferenciaErro } from './referenciasErro';

type TipoFuzz = 'arquivo' | 'diretorio';

type PayloadComando = {
  id: number;
  args: Record<string, unknown>;
  projectId: number;
};

type MetadadosFfuf = AlvoResolvido & {
  projectId: number;
  tipoFuzz: TipoFuzz;
  saidaJson: string;
  saidaLog: string;
  referenciaErro: ReferenciaErro | null;
};

type ResultadoDiretorio = {
  caminho: string;
  status: number | null;
  tamanho: number | null;
};

type ResultadoFfufBruto = {
  status?: unknown;
  length?: unknown;
  input?: { FUZZ?: string };
};

type RetornoTerminal = {
  id: number;
  stdout?: string;
  meta: MetadadosFfuf;
  command: string;
  args: string[];
};

type ErroTerminal = {
  id: number;
  error: string;
  meta?: Partial<MetadadosFfuf>;
};

export class FfufService extends NanoService {
  constructor() {
    super('FfufService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'ffuf') this.processarComando(payload);
    });
    this.listen(NanoEvents.FFUF_RESULT, (payload) => this.processarResultado(payload));
    this.listen(NanoEvents.FFUF_ERROR, (payload) => this.processarErro(payload));
  }

  private async processarComando(payload: PayloadComando) {
    const { id, args, projectId } = payload;

    this.log(`Processando Ffuf para o projeto ${projectId}`);

    try {
      const { dominio, ip, alvo, caminhoBase } = await resolverAlvo(args);
      const extensoes = args.extensoes || '.php,.html,.txt,.js,.bak,.zip,.conf';
      const tipoFuzz = this.definirTipoFuzz(args);
      const alvoNormalizado = this.normalizarAlvo(alvo);
      const alvoComBarra = this.aplicarBarra(alvoNormalizado);
      const referenciaErro = await coletarReferenciasErro(alvoComBarra);
      const saidaJson = this.criarCaminhoArquivo(`ffuf_results_${id}_${Date.now()}.json`);
      const saidaLog = this.criarCaminhoArquivo(`ffuf_log_${id}_${Date.now()}.txt`);
      const argumentos = this.montarArgumentos(alvoComBarra, tipoFuzz, extensoes, saidaJson);
      const meta: MetadadosFfuf = {
        projectId,
        dominio,
        ip,
        caminhoBase,
        alvo: alvoComBarra,
        tipoFuzz,
        saidaJson,
        saidaLog,
        referenciaErro
      };

      this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
        id,
        command: 'ffuf',
        args: argumentos,
        outputFile: saidaLog,
        replyTo: NanoEvents.FFUF_RESULT,
        errorTo: NanoEvents.FFUF_ERROR,
        meta
      });
    } catch (e: unknown) {
      const erro = e instanceof Error ? e.message : 'Erro desconhecido';
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: erro });
    }
  }

  private async processarResultado(payload: RetornoTerminal) {
    const { id, stdout, meta, command, args } = payload;
    const { dominio, ip, caminhoBase, saidaJson, saidaLog, tipoFuzz, referenciaErro } = meta;

    this.log(`Processando resultado ${id}`);

    try {
      const conteudo = this.lerSaida(saidaJson);
      const dados = this.extrairResultados(conteudo, caminhoBase || '');
      const filtrados = filtrarResultadosErro(dados, referenciaErro);
      const registrosNormalizados = this.deduplicarResultados(filtrados, tipoFuzz);
      const registros = this.ajustarTipoResultados(registrosNormalizados, tipoFuzz);

      for (const resultado of registros) {
        await prisma.diretorio.create({
          data: {
            caminho: resultado.caminho,
            status: resultado.status,
            tamanho: resultado.tamanho,
            dominioId: dominio ? dominio.id : null,
            ipId: ip ? ip.id : null,
            tipo: tipoFuzz === 'arquivo' ? 'arquivo' : 'diretorio'
          }
        });
      }

      this.removerArquivos(saidaJson, saidaLog);

      this.bus.emit(NanoEvents.JOB_COMPLETED, {
        id,
        result: registros,
        rawOutput: stdout,
        executedCommand: `${command} ${args.join(' ')}`
      });
    } catch (e: unknown) {
      this.removerArquivos(saidaJson, saidaLog);

      const erro = e instanceof Error ? e.message : 'Erro desconhecido';
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: erro });
    }
  }

  private processarErro(payload: ErroTerminal) {
    const { id, error, meta } = payload;
    const { saidaJson, saidaLog } = meta || {};

    this.removerArquivos(saidaJson, saidaLog);

    this.bus.emit(NanoEvents.JOB_FAILED, { id, error });
  }

  private definirTipoFuzz(args: Record<string, unknown>): TipoFuzz {
    return args.tipoFuzz === 'arquivo' ? 'arquivo' : 'diretorio';
  }

  private aplicarBarra(alvo: string) {
    return alvo.endsWith('/') ? alvo : `${alvo}/`;
  }

  private normalizarAlvo(alvo: string) {
    return alvo.endsWith('/') ? alvo.slice(0, -1) : alvo;
  }

  private criarCaminhoArquivo(nome: string) {
    return path.join(os.tmpdir(), nome);
  }

  private montarArgumentos(alvo: string, tipoFuzz: TipoFuzz, extensoes: string, saidaJson: string) {
    const destino = `${this.aplicarBarra(alvo)}FUZZ`;
    const argumentosBase = [
      '-u',
      destino,
      '-w',
      '/usr/share/wordlists/dirb/common.txt',
      '-o',
      saidaJson,
      '-of',
      'json',
      '-k'
    ];
    return tipoFuzz === 'arquivo' ? [...argumentosBase, '-e', extensoes] : argumentosBase;
  }

  private lerSaida(caminho: string) {
    if (!caminho || !fs.existsSync(caminho)) throw new Error('Saída não encontrada');
    return fs.readFileSync(caminho, 'utf8');
  }

  private extrairResultados(conteudo: string, prefixo: string) {
    const dados = JSON.parse(conteudo);
    const resultados = Array.isArray(dados.results) ? (dados.results as ResultadoFfufBruto[]) : [];
    return this.normalizarResultados(resultados, prefixo);
  }

  private deduplicarResultados(resultados: ResultadoDiretorio[], tipo: TipoFuzz) {
    const mapa = new Map<string, ResultadoDiretorio>();
    resultados.forEach((resultado) => {
      const caminhoNormalizado = tipo === 'diretorio' ? this.aplicarBarraResultado(resultado.caminho) : resultado.caminho;
      const chave = tipo === 'diretorio' ? this.removerBarraResultado(caminhoNormalizado) : caminhoNormalizado;
      const existente = mapa.get(chave);
      if (!existente || (tipo === 'diretorio' && !existente.caminho.endsWith('/') && caminhoNormalizado.endsWith('/'))) {
        mapa.set(chave, { ...resultado, caminho: caminhoNormalizado });
      }
    });
    return Array.from(mapa.values());
  }

  private ajustarTipoResultados(resultados: ResultadoDiretorio[], tipo: TipoFuzz) {
    if (tipo !== 'diretorio') return resultados;
    return resultados.map((resultado) => ({
      ...resultado,
      caminho: this.aplicarBarraResultado(resultado.caminho)
    }));
  }

  private normalizarResultados(resultados: ResultadoFfufBruto[], prefixo: string) {
    return resultados
      .map((resultado) => this.mapearResultado(resultado, prefixo))
      .filter((resultado): resultado is ResultadoDiretorio => Boolean(resultado));
  }

  private mapearResultado(resultado: ResultadoFfufBruto, prefixo: string): ResultadoDiretorio | null {
    const parte = resultado?.input?.FUZZ ?? '';
    const caminho = this.normalizarCaminho(prefixo, parte);
    const status = Number.parseInt(String(resultado?.status ?? ''), 10);
    const tamanho = Number.parseInt(String(resultado?.length ?? ''), 10);

    if (!caminho) return null;

    return {
      caminho,
      status: Number.isNaN(status) ? null : status,
      tamanho: Number.isNaN(tamanho) ? null : tamanho
    };
  }

  private normalizarCaminho(base: string, parte: string) {
    const prefixo = base || '';
    const caminhoBase = prefixo ? (prefixo.startsWith('/') ? prefixo : `/${prefixo}`) : '';
    const complemento = parte.startsWith('/') ? parte : `/${parte}`;
    const limpo = `${caminhoBase}${complemento}`.replace(/\/+/g, '/');
    return limpo === '' ? '/' : limpo;
  }

  private aplicarBarraResultado(caminho: string) {
    return caminho.endsWith('/') ? caminho : `${caminho}/`;
  }

  private removerBarraResultado(caminho: string) {
    return caminho.endsWith('/') ? caminho.slice(0, -1) : caminho;
  }

  private removerArquivos(...arquivos: (string | null | undefined)[]) {
    arquivos.forEach((arquivo) => {
      if (arquivo && fs.existsSync(arquivo)) fs.unlinkSync(arquivo);
    });
  }
}
