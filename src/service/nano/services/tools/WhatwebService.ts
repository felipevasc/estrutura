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

  private lerRegistros(caminho: string): any[] {
    if (!caminho || !fs.existsSync(caminho)) return [];
    const conteudo = fs.readFileSync(caminho, 'utf-8');

    // Tenta fazer parse do arquivo inteiro primeiro (formato JSON Array)
    try {
        const json = JSON.parse(conteudo);
        return Array.isArray(json) ? json : [json];
    } catch (e) {
        // Se falhar, tenta ler linha a linha (formato NDJSON)
        const linhas = conteudo.split('\n').map((linha) => linha.trim()).filter(Boolean);
        return linhas.map((linha) => {
            try {
                return JSON.parse(linha);
            } catch {
                return null;
            }
        }).filter((item) => item !== null);
    }
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

      return Object.entries(plugins).flatMap(([plugin, valores]) => {
        // "valores" no whatweb JSON output pode ser:
        // 1. Array de objetos: [{string: "foo", account: "bar"}, {version: "1.2"}]
        // 2. Objeto (se for um resultado simples, mas whatweb geralmente usa array de matches)
        // O valor do plugin é um array de "matches".

        // Vamos normalizar para array
        const listaValores = Array.isArray(valores) ? valores : [valores];

        return listaValores.map((match: any) => {
          // Cada match é um objeto com propriedades como "string", "version", "account", etc.
          // Vamos converter para string legível para "valor"
          // E salvar o objeto completo em "dados"

          let valorString = '';
          if (match && typeof match === 'object') {
              if (match.string) valorString += Array.isArray(match.string) ? match.string.join(', ') : match.string;
              if (match.version) valorString += (valorString ? ' ' : '') + `v${Array.isArray(match.version) ? match.version.join(', ') : match.version}`;
              if (match.account) valorString += (valorString ? ' ' : '') + `Account: ${Array.isArray(match.account) ? match.account.join(', ') : match.account}`;
              if (match.module) valorString += (valorString ? ' ' : '') + `Module: ${Array.isArray(match.module) ? match.module.join(', ') : match.module}`;

              // Fallback se não tiver campos conhecidos
              if (!valorString) valorString = JSON.stringify(match);
          } else {
              valorString = String(match);
          }

          return {
            plugin,
            valor: valorString,
            dados: match,
            dominioId,
            ipId,
            diretorioId
          };
        });
      });
    });
  }
}
