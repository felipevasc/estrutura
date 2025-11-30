import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { TipoPorta } from '@/database/functions/ip';
import { NanoEvents } from '../../events';
import { extrairPortasGrep } from './parserPortas';

export class RustscanService extends NanoService {
  constructor() {
    super('RustscanService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'rustscan') {
        this.processarComando(payload);
      }
    });

    this.listen(NanoEvents.RUSTSCAN_TERMINAL_RESULT, (payload) => this.processarResultado(payload));
    this.listen(NanoEvents.RUSTSCAN_TERMINAL_ERROR, (payload) => this.processarErro(payload));
  }

  private async processarComando(payload: any) {
    const { id, args, projectId } = payload;
    const idIp = args.idIp;
    const faixaPortas = args.faixaPortas || "1-65535";

    this.log(`Iniciando Rustscan para IP ${idIp}`);

    try {
        const ipBanco = await prisma.ip.findFirst({ where: { id: Number(idIp) } });
        const enderecoIp = ipBanco?.endereco ?? "";

        if (!enderecoIp) throw new Error('IP not found');
        const outputPrefix = path.join(os.tmpdir(), `rustscan_${ipBanco?.projetoId}_${id}_${Date.now()}`);
        const grepOutput = `${outputPrefix}.gnmap`;
        const stdoutFile = `${outputPrefix}.stdout`;

        const comando = 'rustscan';
        const argumentos = ['-a', enderecoIp, '-r', `${faixaPortas}`, '--', '-Pn', '-sV', '-oG', grepOutput];

        this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
            id,
            command: comando,
            args: argumentos,
            outputFile: stdoutFile,
            replyTo: NanoEvents.RUSTSCAN_TERMINAL_RESULT,
            errorTo: NanoEvents.RUSTSCAN_TERMINAL_ERROR,
            meta: { projectId, idIp, grepOutput, stdoutFile }
        });
    } catch (e: any) {
        this.bus.emit(NanoEvents.JOB_FAILED, { id, error: e.message });
    }
  }

  private async processarResultado(payload: any) {
      const { id, meta, command, args } = payload;
      const { idIp, grepOutput, stdoutFile } = meta;

      this.log(`Finalizando Rustscan ${id}`);

      try {
        const portas: TipoPorta[] = [];

        if (fs.existsSync(grepOutput)) {
            const conteudo = fs.readFileSync(grepOutput, 'utf-8');
            const extraidas = extrairPortasGrep(conteudo);
            portas.push(...extraidas);
            fs.unlinkSync(grepOutput);
        }

        if (fs.existsSync(stdoutFile)) fs.unlinkSync(stdoutFile);

        await Database.adicionarPortas(portas, Number(idIp));

        this.bus.emit(NanoEvents.JOB_COMPLETED, {
            id,
            result: portas,
            rawOutput: "Output stored in DB",
            executedCommand: `${command} ${args.join(' ')}`
        });
      } catch (e: any) {
          if (grepOutput && fs.existsSync(grepOutput)) fs.unlinkSync(grepOutput);
          if (stdoutFile && fs.existsSync(stdoutFile)) fs.unlinkSync(stdoutFile);

          this.bus.emit(NanoEvents.JOB_FAILED, { id, error: e.message });
      }
  }

  private processarErro(payload: any) {
      const { id, error, meta } = payload;
      const { grepOutput, stdoutFile } = meta || {};

      if (grepOutput && fs.existsSync(grepOutput)) fs.unlinkSync(grepOutput);
      if (stdoutFile && fs.existsSync(stdoutFile)) fs.unlinkSync(stdoutFile);

      this.bus.emit(NanoEvents.JOB_FAILED, { id, error });
  }
}
