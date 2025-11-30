import { NanoService } from '../../NanoService';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { NanoEvents } from '../../events';
import { resolverAlvo } from './resolvedorAlvo';
import Database from '@/database/Database';
import { ResultadoWhatweb } from '@/database/functions/whatweb';
import prisma from '@/database';

type PayloadComando = {
  id: number;
  args: Record<string, unknown>;
  projectId: number;
};

type MetadadosWhatweb = {
  projetoId: number;
  alvo: string;
  arquivoSaida: string;
  dominioId: number | null;
  ipId: number | null;
  diretorioId: number | null;
  portaId: number | null;
};

type ResultadoTerminal = {
  id: number;
  stdout?: string;
  meta: MetadadosWhatweb;
  command: string;
  args: string[];
};

type ErroTerminal = {
  id: number;
  error: string;
  meta?: Partial<MetadadosWhatweb>;
};

export class WhatwebService extends NanoService {
  constructor() {
    super('WhatwebService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'whatweb') this.processarComando(payload);
    });

    this.listen(NanoEvents.WHATWEB_RESULT, (payload) => this.processarResultado(payload));
    this.listen(NanoEvents.WHATWEB_ERROR, (payload) => this.processarErro(payload));
  }

  private async processarComando(payload: PayloadComando) {
    const { id, args, projectId } = payload;

    try {
      const { alvo, dominio, ip, porta } = await resolverAlvo(args);
      let diretorioId: number | null = null;
      if (args.idDiretorio) {
        const idDir = Number(args.idDiretorio);
        if (Number.isFinite(idDir)) {
           const dir = await prisma.diretorio.findUnique({ where: { id: idDir } });
           if (dir) diretorioId = dir.id;
        }
      }

      const arquivoSaida = this.gerarCaminhoSaida(projectId, id);
      const autenticacao = process.env.WHATWEB_AUTENTICACAO?.trim();
      const timeout = Number(process.env.WHATWEB_TIMEOUT || '60');
      const aggression = process.env.WHATWEB_AGGRESSION || '1';
      const userAgent = process.env.WHATWEB_USER_AGENT?.trim();

      const argumentos = [`--log-json=${arquivoSaida}`];

      if (autenticacao) argumentos.push(`--header=Authorization: ${autenticacao}`);
      if (timeout > 0) {
        argumentos.push(`--open-timeout=${timeout}`);
        argumentos.push(`--read-timeout=${timeout}`);
      }
      if (aggression && ['1', '3', '4'].includes(aggression)) {
        argumentos.push(`--aggression=${aggression}`);
      }
      if (userAgent) {
        argumentos.push(`--user-agent=${userAgent}`);
      }

      argumentos.push(alvo);

      const meta: MetadadosWhatweb = {
        projetoId: projectId,
        alvo,
        arquivoSaida,
        dominioId: dominio?.id ?? null,
        ipId: ip?.id ?? null,
        diretorioId,
        portaId: porta?.id ?? null
      };

      this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
        id,
        command: 'whatweb',
        args: argumentos,
        replyTo: NanoEvents.WHATWEB_RESULT,
        errorTo: NanoEvents.WHATWEB_ERROR,
        meta,
      });
    } catch (e: unknown) {
      const erro = e instanceof Error ? e.message : 'Erro desconhecido';
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: erro });
    }
  }

  private async processarResultado(payload: ResultadoTerminal) {
    const { id, stdout, meta, command, args } = payload;
    const { arquivoSaida, dominioId, ipId, diretorioId, portaId } = meta;

    try {
      const registros = this.lerRegistros(arquivoSaida);
      const resultados = this.extrairResultados(registros, dominioId, ipId, diretorioId, portaId);
      const persistidos = await Database.criarResultadosWhatweb(resultados);
      this.removerArquivo(arquivoSaida);

      this.bus.emit(NanoEvents.JOB_COMPLETED, {
        id,
        result: persistidos,
        rawOutput: stdout,
        executedCommand: `${command} ${args.join(' ')}`,
      });
    } catch (e: unknown) {
      this.removerArquivo(arquivoSaida);
      const erro = e instanceof Error ? e.message : 'Erro desconhecido';
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: erro });
    }
  }

  private processarErro(payload: ErroTerminal) {
    const { id, error, meta } = payload;
    const { arquivoSaida } = meta || {};

    this.removerArquivo(arquivoSaida);

    this.bus.emit(NanoEvents.JOB_FAILED, { id, error });
  }

  private gerarCaminhoSaida(projetoId: number, id: number) {
    return path.join(os.tmpdir(), `whatweb_${projetoId}_${id}_${Date.now()}.json`);
  }

  private lerRegistros(caminho: string) {
    if (!caminho || !fs.existsSync(caminho)) return [];
    const conteudo = fs.readFileSync(caminho, 'utf-8');
    const linhas = conteudo.split('\n').map((linha) => linha.trim()).filter(Boolean);
    return linhas.map((linha) => JSON.parse(linha));
  }

  private removerArquivo(caminho?: string) {
    if (caminho && fs.existsSync(caminho)) fs.unlinkSync(caminho);
  }

  private extrairResultados(registros: unknown[], dominioId: number | null, ipId: number | null, diretorioId: number | null, portaId: number | null): ResultadoWhatweb[] {
    if (!Array.isArray(registros)) return [];

    return registros.flatMap((registro) => {
      if (!registro || typeof registro !== 'object') return [] as ResultadoWhatweb[];
      const plugins = (registro as { plugins?: Record<string, unknown> }).plugins;
      if (!plugins || typeof plugins !== 'object') return [] as ResultadoWhatweb[];

      return Object.entries(plugins).flatMap(([plugin, valores]) => {
        const listaValores = Array.isArray(valores) ? valores : [valores];
        return listaValores.map((valor) => ({
          plugin,
          valor: typeof valor === 'string' ? valor : JSON.stringify(valor),
          dados: valor,
          dominioId,
          ipId,
          diretorioId,
          portaId
        }));
      });
    });
  }
}
