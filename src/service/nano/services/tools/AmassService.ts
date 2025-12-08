import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { TipoIp } from '@/database/functions/ip';
import { TipoDominio } from '@prisma/client';
import { NanoEvents } from '../../events';
import { lerLogExecucao, obterCaminhoLogExecucao, obterComandoRegistrado, registrarComandoFerramenta } from './armazenamentoExecucao';

interface CommandPayload {
  id: number;
  args: any;
  projectId: number;
  command: string;
}

interface TerminalResultPayload {
  executionId?: number;
  id?: number;
  output?: string;
  meta: any;
  command?: string;
  args?: string[];
  error?: string;
}

export class AmassService extends NanoService {
  constructor() {
    super('AmassService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload: any) => {
      if (payload.command === 'amass') {
        this.processarComando(payload);
      }
    });

    this.listen(NanoEvents.AMASS_TERMINAL_RESULT, (payload: any) => this.processarResultado(payload));
    this.listen(NanoEvents.AMASS_TERMINAL_ERROR, (payload: any) => this.processarErro(payload));
  }

  private async processarComando(payload: CommandPayload) {
    const { id, args, projectId } = payload;

    try {
      const dados = typeof args === 'string' ? JSON.parse(args) : args ?? {};
      const idDominio = Number(dados.idDominio);
      const timeout = Number(dados.timeoutMinutos ?? 5);

      this.log(`Processando Amass para o domínio ${idDominio}`);

      if (!Number.isInteger(idDominio) || idDominio <= 0) {
        throw new Error('Domínio não informado ou inválido.');
      }

      const op = await prisma.dominio.findFirst({
        where: { id: Number(idDominio) }
      });

      const dominio = op?.endereco ?? '';

      if (!op?.endereco || !this.validarDominio(dominio)) {
        throw new Error('Domínio inválido ou inseguro fornecido.');
      }

      const arquivoJson = path.join(os.tmpdir(), `amass_${op?.projetoId}_${id}_${Date.now()}.json`);

      const argumentos = ['enum', '-d', dominio, '-timeout', `${timeout > 0 ? timeout : 5}m`, '-json', arquivoJson];
      const linhaComando = registrarComandoFerramenta('amass', id, 'amass', argumentos);
      const caminhoLog = obterCaminhoLogExecucao(id);

      this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
        id,
        command: 'amass',
        args: argumentos,
        outputFile: caminhoLog,
        replyTo: NanoEvents.AMASS_TERMINAL_RESULT,
        errorTo: NanoEvents.AMASS_TERMINAL_ERROR,
        meta: { projectId, dominio, op, jsonOutputFile: arquivoJson, linhaComando }
      });
    } catch (e: unknown) {
      this.bus.emit(NanoEvents.JOB_FAILED, {
        id,
        error: (e as Error).message || String(e)
      });
    }
  }

  private async processarResultado(payload: TerminalResultPayload) {
    const { executionId, id, output, meta, command, args } = payload;
    const jobId = (id ?? executionId) as number;
    const { op, jsonOutputFile, linhaComando } = meta;

    this.log(`Processando resultado ${jobId}`);

    try {
      const subdominios: string[] = [];
      const ips: TipoIp[] = [];

      if (fs.existsSync(jsonOutputFile)) {
        const conteudo = fs.readFileSync(jsonOutputFile, 'utf-8');
        const linhas = conteudo.split('\n').filter((linha) => linha.trim());

        for (const linha of linhas) {
          try {
            const item = JSON.parse(linha);

            if (item.name) {
              subdominios.push(item.name);
            }

            if (Array.isArray(item.addresses)) {
              for (const endereco of item.addresses) {
                if (endereco.ip) {
                  ips.push({
                    endereco: endereco.ip,
                    dominio: item.name || item.domain
                  });
                }
              }
            }
          } catch {
              // ignore
          }
        }

        fs.unlinkSync(jsonOutputFile);
      }

      const subdominiosUnicos = [...new Set(subdominios)];
      const ipsUnicos = ips.filter((valor, indice, array) => array.findIndex((item) => item.endereco === valor.endereco && item.dominio === valor.dominio) === indice);

      if (subdominiosUnicos.length > 0) {
        await Database.adicionarSubdominio(subdominiosUnicos, op?.projetoId ?? 0, TipoDominio.dns);
      }

      if (ipsUnicos.length > 0) {
        await Database.adicionarIp(ipsUnicos, op?.projetoId ?? 0);
      }

      this.bus.emit(NanoEvents.JOB_COMPLETED, {
        id: jobId,
        result: { subdominios: subdominiosUnicos, ips: ipsUnicos },
        rawOutput: lerLogExecucao(jobId) || output,
        executedCommand: linhaComando || obterComandoRegistrado('amass', jobId as number) || `${command} ${(args as any).join(' ')}`
      });
    } catch (e: unknown) {
      if (jsonOutputFile && fs.existsSync(jsonOutputFile)) fs.unlinkSync(jsonOutputFile);

      this.bus.emit(NanoEvents.JOB_FAILED, {
        id: jobId,
        error: (e as Error).message || String(e)
      });
    }
  }

  private processarErro(payload: TerminalResultPayload) {
    const { executionId, id, error, meta } = payload;
    const { jsonOutputFile } = meta || {};

    if (jsonOutputFile && fs.existsSync(jsonOutputFile)) fs.unlinkSync(jsonOutputFile);

    this.bus.emit(NanoEvents.JOB_FAILED, {
      id: id ?? executionId,
      error: error
    });
  }

  private validarDominio(dominio: string): boolean {
    const regexDominio = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
    return regexDominio.test(dominio);
  }
}
