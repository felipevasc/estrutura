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
      const { alvo, dominio, ip } = await resolverAlvo(args);
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
      const argumentos = [`--log-json=${arquivoSaida}`];
      if (autenticacao) argumentos.push(`--header=Authorization: ${autenticacao}`);
      if (timeout > 0) {
        argumentos.push(`--open-timeout=${timeout}`);
        argumentos.push(`--read-timeout=${timeout}`);
      }
      argumentos.push(alvo);
      const meta: MetadadosWhatweb = {
        projetoId: projectId,
        alvo,
        arquivoSaida,
        dominioId: dominio?.id ?? null,
        ipId: ip?.id ?? null,
        diretorioId
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
    const { arquivoSaida, dominioId, ipId, diretorioId } = meta;

    try {
      const registros = this.lerRegistros(arquivoSaida);
      const resultados = this.extrairResultados(registros, dominioId, ipId, diretorioId);
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

  private extrairResultados(registros: unknown[], dominioId: number | null, ipId: number | null, diretorioId: number | null): ResultadoWhatweb[] {
    if (!Array.isArray(registros)) return [];

    return registros.flatMap((registro) => {
      if (!registro || typeof registro !== 'object') return [] as ResultadoWhatweb[];
      const plugins = (registro as { plugins?: Record<string, unknown> }).plugins;
      if (!plugins || typeof plugins !== 'object') return [] as ResultadoWhatweb[];

      return Object.entries(plugins).flatMap(([plugin, rawData]) => {
        const dataList = Array.isArray(rawData) ? rawData : [rawData];

        return dataList.flatMap((dadosPlugin: unknown) => {
          if (typeof dadosPlugin !== 'object' || dadosPlugin === null) return [];
          const dados = dadosPlugin as Record<string, unknown>;

          const results: ResultadoWhatweb[] = [];

          const add = (val: string) => {
            results.push({
              plugin,
              valor: val,
              dados: dados,
              dominioId,
              ipId,
              diretorioId
            });
          };

          const priorityKeys = ['string', 'version', 'os', 'account', 'model', 'firmware', 'module', 'country'];
          const processedKeys = new Set<string>();

          priorityKeys.forEach(key => {
            if (key in dados) {
              processedKeys.add(key);
              const values = dados[key];
              const list = Array.isArray(values) ? values : [values];
              list.forEach((v: unknown) => {
                if (key === 'string') add(String(v));
                else add(`${key}: ${v}`);
              });
            }
          });

          Object.entries(dados).forEach(([key, values]) => {
            if (processedKeys.has(key) || key === 'name') return;
            const list = Array.isArray(values) ? values : [values];
            list.forEach((v: unknown) => {
              add(`${key}: ${v}`);
            });
          });

          if (results.length === 0) {
            add(JSON.stringify(dados));
          }

          return results;
        });
      });
    });
  }
}
