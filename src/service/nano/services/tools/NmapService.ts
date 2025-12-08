import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { TipoPorta } from '@/database/functions/ip';
import { NanoEvents } from '../../events';
import { extrairPortasGrep } from './parserPortas';
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

export class NmapService extends NanoService {
  constructor() {
    super('NmapService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload: any) => {
      if (payload.command === 'nmap') {
        this.processCommand(payload as CommandPayload);
      }
    });

    this.listen(NanoEvents.NMAP_TERMINAL_RESULT, (payload: any) => this.processResult(payload as TerminalResultPayload));
    this.listen(NanoEvents.NMAP_TERMINAL_ERROR, (payload: any) => this.processError(payload as TerminalResultPayload));
  }

  private async processCommand(payload: CommandPayload) {
    const { id, args, projectId } = payload;
    const idIp = args.idIp;
    const faixaPortas = args.faixaPortas || "1-9999";

    this.log(`Processing Nmap for IP ID: ${idIp}`);

    try {
        const op = await prisma.ip.findFirst({
            where: { id: Number(idIp) }
        });
        const enderecoIp = op?.endereco ?? "";

        if (!enderecoIp) throw new Error('IP not found');
        const outputPrefix = path.join(os.tmpdir(), `nmap_${op?.projetoId}_${id}_${Date.now()}`);
        const grepOutput = `${outputPrefix}.gnmap`;

        const comando = 'nmap';
        const argumentos = ['-Pn', enderecoIp, "-p", `${faixaPortas}`, "-oG", grepOutput];
        const linhaComando = registrarComandoFerramenta('nmap', id, comando, argumentos);
        const caminhoLog = obterCaminhoLogExecucao(id);

        this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: caminhoLog,
            replyTo: NanoEvents.NMAP_TERMINAL_RESULT,
            errorTo: NanoEvents.NMAP_TERMINAL_ERROR,
            meta: { projectId, enderecoIp, op, idIp, grepOutput, linhaComando }
        });

    } catch (e: unknown) {
        this.bus.emit(NanoEvents.JOB_FAILED, {
            id: id,
            error: (e as Error).message || String(e)
        });
    }
  }

  private async processResult(payload: TerminalResultPayload) {
      const { id, meta, command, args } = payload;
      const { idIp, grepOutput, linhaComando } = meta;

      this.log(`Processing result for ${id}`);

      try {
        const portas: TipoPorta[] = [];

        if (fs.existsSync(grepOutput)) {
            const content = fs.readFileSync(grepOutput, 'utf-8');
            const extraidas = extrairPortasGrep(content);
            portas.push(...extraidas);
            fs.unlinkSync(grepOutput);
        } else {
            this.log("Warning: Nmap grepable output missing.");
        }

        await Database.adicionarPortas(portas, Number(idIp));

        this.bus.emit(NanoEvents.JOB_COMPLETED, {
            id: id!,
            result: portas,
            rawOutput: lerLogExecucao(id as number) || payload.output,
            executedCommand: linhaComando || obterComandoRegistrado('nmap', id as number) || `${command} ${(args as any).join(' ')}`
        });

      } catch (e: unknown) {
          if (grepOutput && fs.existsSync(grepOutput)) fs.unlinkSync(grepOutput);

          this.bus.emit(NanoEvents.JOB_FAILED, {
              id: id!,
              error: (e as Error).message || String(e)
          });
      }
  }

  private processError(payload: TerminalResultPayload) {
      const { id, error, meta } = payload;
      const { grepOutput, stdoutFile } = meta || {};

      if (grepOutput && fs.existsSync(grepOutput)) fs.unlinkSync(grepOutput);
      if (stdoutFile && fs.existsSync(stdoutFile)) fs.unlinkSync(stdoutFile);

      this.bus.emit(NanoEvents.JOB_FAILED, {
          id: id,
          error: error
      });
  }
}
