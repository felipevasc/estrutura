import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { TipoPorta } from '@/database/functions/ip';
import { NanoEvents } from '../../events';
import { extrairPortasGrep } from './parserPortas';

export class NmapService extends NanoService {
  constructor() {
    super('NmapService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'nmap') {
        this.processCommand(payload);
      }
    });

    this.listen(NanoEvents.NMAP_TERMINAL_RESULT, (payload) => this.processResult(payload));
    this.listen(NanoEvents.NMAP_TERMINAL_ERROR, (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
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
        const stdoutFile = `${outputPrefix}.stdout`;

        const comando = 'nmap';
        const argumentos = ['-Pn', enderecoIp, "-p", `${faixaPortas}`, "-oG", grepOutput];

        this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: stdoutFile,
            replyTo: NanoEvents.NMAP_TERMINAL_RESULT,
            errorTo: NanoEvents.NMAP_TERMINAL_ERROR,
            meta: { projectId, enderecoIp, op, idIp, grepOutput, stdoutFile }
        });

    } catch (e: any) {
        this.bus.emit(NanoEvents.JOB_FAILED, {
            id: id,
            error: e.message
        });
    }
  }

  private async processResult(payload: any) {
      const { id, meta, command, args } = payload;
      const { idIp, grepOutput, stdoutFile } = meta;

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

        if (fs.existsSync(stdoutFile)) {
             fs.unlinkSync(stdoutFile);
        }

        await Database.adicionarPortas(portas, Number(idIp));

        this.bus.emit(NanoEvents.JOB_COMPLETED, {
            id: id,
            result: portas,
            rawOutput: "Output stored in DB",
            executedCommand: `${command} ${args.join(' ')}`
        });

      } catch (e: any) {
          if (grepOutput && fs.existsSync(grepOutput)) fs.unlinkSync(grepOutput);
          if (stdoutFile && fs.existsSync(stdoutFile)) fs.unlinkSync(stdoutFile);

          this.bus.emit(NanoEvents.JOB_FAILED, {
              id: id,
              error: e.message
          });
      }
  }

  private processError(payload: any) {
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
