import { NanoService } from '../../NanoService';
import prisma from '@/database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { NanoEvents } from '../../events';
import { extrairResultadosGobuster, ResultadoGobuster } from './parserGobuster';
import { AlvoResolvido, resolverAlvo } from './resolvedorAlvo';
import { coletarReferenciasErro, filtrarResultadosErro, ReferenciaErro } from './referenciasErro';

type TipoFuzz = 'arquivo' | 'diretorio';

type PayloadComando = {
  id: number;
  args: Record<string, unknown>;
  projectId: number;
};

type MetadadosGobuster = AlvoResolvido & {
  projectId: number;
  arquivoResultado: string;
  arquivoLog: string;
  tipoFuzz: TipoFuzz;
  referenciaErro: ReferenciaErro | null;
};

type ResultadoDiretorio = {
  caminho: string;
  status: number | null;
  tamanho: number | null;
};

type RetornoTerminal = {
  id: number;
  stdout?: string;
  meta: MetadadosGobuster;
  command: string;
  args: string[];
};

type ErroTerminal = {
  id: number;
  error: string;
  meta?: Partial<MetadadosGobuster>;
};

export class GobusterService extends NanoService {
  constructor() {
    super('GobusterService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'gobuster') this.processarComando(payload);
    });

    this.listen(NanoEvents.GOBUSTER_RESULT, (payload) => this.processarResultado(payload));
    this.listen(NanoEvents.GOBUSTER_ERROR, (payload) => this.processarErro(payload));
  }

  private async processarComando(payload: PayloadComando) {
    const { id, args, projectId } = payload;

    this.log(`Iniciando Gobuster para projeto ${projectId}`);

    try {
      const { dominio, ip, alvo, caminhoBase } = await resolverAlvo(args);
      const tipoFuzz = this.definirTipoFuzz(args);
      const extensoes = typeof args.extensoes === 'string' && args.extensoes ? args.extensoes : '.php,.html,.txt,.js,.bak,.zip,.conf';
      const wordlist = typeof args.wordlist === 'string' && args.wordlist ? args.wordlist : '/usr/share/wordlists/dirb/common.txt';
      const alvoNormalizado = this.normalizarAlvo(alvo);
      const alvoComBarra = this.aplicarBarra(alvoNormalizado);
      const referenciaErro = await coletarReferenciasErro(alvoComBarra);
      const arquivoResultado = this.criarCaminhoArquivo(`gobuster_${projectId}_${id}_${Date.now()}.txt`);
      const arquivoLog = this.criarCaminhoArquivo(`gobuster_${projectId}_${id}_${Date.now()}_log.txt`);
      const argumentos = this.montarArgumentos(alvoComBarra, tipoFuzz, extensoes, wordlist, arquivoResultado);
      const meta: MetadadosGobuster = {
        projectId,
        dominio,
        ip,
        arquivoResultado,
        arquivoLog,
        alvo: alvoComBarra,
        caminhoBase,
        tipoFuzz,
        referenciaErro
      };

      this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
        id,
        command: 'gobuster',
        args: argumentos,
        outputFile: arquivoLog,
        replyTo: NanoEvents.GOBUSTER_RESULT,
        errorTo: NanoEvents.GOBUSTER_ERROR,
        meta
      });
    } catch (e: unknown) {
      const erro = e instanceof Error ? e.message : 'Erro desconhecido';
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: erro });
    }
  }

  private async processarResultado(payload: RetornoTerminal) {
    const { id, meta, command, args } = payload;
    const { dominio, ip, arquivoResultado, arquivoLog, alvo, caminhoBase, tipoFuzz, referenciaErro } = meta;

    try {
      const conteudo = this.lerSaida(arquivoResultado);
      const brutos = extrairResultadosGobuster(conteudo, alvo);
      const normalizados = this.normalizarResultados(brutos, caminhoBase || '');
      const filtrados = filtrarResultadosErro(normalizados, referenciaErro);
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

      this.removerArquivos(arquivoResultado, arquivoLog);

      this.bus.emit(NanoEvents.JOB_COMPLETED, {
        id,
        result: registros,
        rawOutput: conteudo,
        executedCommand: `${command} ${args.join(' ')}`
      });
    } catch (e: unknown) {
      this.removerArquivos(arquivoResultado, arquivoLog);

      const erro = e instanceof Error ? e.message : 'Erro desconhecido';
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: erro });
    }
  }

  private processarErro(payload: ErroTerminal) {
    const { id, error, meta } = payload;
    const { arquivoResultado, arquivoLog } = meta || {};

    this.removerArquivos(arquivoResultado, arquivoLog);

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

  private montarArgumentos(alvo: string, tipoFuzz: TipoFuzz, extensoes: string, wordlist: string, arquivoResultado: string) {
    const destino = this.aplicarBarra(alvo);
    const argumentosBase = ['dir', '-u', destino, '-w', wordlist, '-o', arquivoResultado, '-q', '-k'];
    return tipoFuzz === 'arquivo' ? [...argumentosBase, '-x', extensoes] : argumentosBase;
  }

  private lerSaida(caminho: string) {
    if (!caminho || !fs.existsSync(caminho)) throw new Error('Saída não encontrada');
    return fs.readFileSync(caminho, 'utf-8');
  }

  private normalizarResultados(resultados: ResultadoGobuster[], prefixo: string) {
    return resultados
      .map((resultado) => this.mapearResultado(resultado, prefixo))
      .filter((resultado): resultado is ResultadoDiretorio => Boolean(resultado));
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

  private mapearResultado(resultado: ResultadoGobuster, prefixo: string): ResultadoDiretorio | null {
    const caminho = this.normalizarCaminho(prefixo, resultado.caminho);
    if (!caminho) return null;

    const status = Number.isNaN(Number(resultado.status)) ? null : resultado.status;
    const tamanho = Number.isNaN(Number(resultado.tamanho)) ? null : resultado.tamanho;

    return { caminho, status, tamanho };
  }

  private normalizarCaminho(base: string, caminho: string) {
    const prefixo = base || '';
    const caminhoBase = prefixo ? (prefixo.startsWith('/') ? prefixo : `/${prefixo}`) : '';
    const alvo = caminho.startsWith('/') ? caminho : `/${caminho}`;
    const limpo = `${caminhoBase}${alvo}`.replace(/\/+/g, '/');
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
