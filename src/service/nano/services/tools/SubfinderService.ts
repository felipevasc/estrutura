import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';

export class SubfinderService extends NanoService {
  initialize(): void {
    this.listen('COMMAND_RECEIVED', (payload) => {
      if (payload.command === 'subfinder') {
        this.processCommand(payload);
      }
    });

    this.listen('SUBFINDER_TERMINAL_RESULT', (payload) => this.processResult(payload));
    this.listen('SUBFINDER_TERMINAL_ERROR', (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { id, args, projectId } = payload;
    const idDominio = args.idDominio;

    this.log(`Processing Subfinder for domain ID: ${idDominio}`);

    try {
        const op = await prisma.dominio.findFirst({
            where: { id: Number(idDominio) }
        });
        const dominio = op?.endereco ?? "";

        if (!dominio) throw new Error('Domain not found');

        const nomeArquivoSaida = `subfinder_resultado_${op?.projetoId}_${op?.id}_${dominio}_${Date.now()}.txt`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

        const comando = 'subfinder';
        const argumentos = ['-d', dominio, "--all", "-silent"];

        this.bus.emit('EXECUTE_TERMINAL', {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: 'SUBFINDER_TERMINAL_RESULT',
            errorTo: 'SUBFINDER_TERMINAL_ERROR',
            meta: { projectId, dominio, op }
        });

    } catch (e: any) {
        this.bus.emit('JOB_FAILED', {
            id: id,
            error: e.message
        });
    }
  }

  private async processResult(payload: any) {
      const { id, stdout, meta, command, args } = payload;
      const { op } = meta;

      this.log(`Processing result for ${id}`);

      try {
        // stdout contains one domain per line because of -silent
        const subdominios = stdout?.split("\n").map((s: string) => s.trim()).filter((s: string) => !!s && s.includes('.')) ?? [];

        await Database.adicionarSubdominio(subdominios, op?.projetoId ?? 0);

        this.bus.emit('JOB_COMPLETED', {
            id: id,
            result: subdominios,
            rawOutput: stdout,
            executedCommand: `${command} ${args.join(' ')}`
        });

      } catch (e: any) {
          this.bus.emit('JOB_FAILED', {
              id: id,
              error: e.message
          });
      }
  }

  private processError(payload: any) {
      const { id, error } = payload;
      this.bus.emit('JOB_FAILED', {
          id: id,
          error: error
      });
  }
}
