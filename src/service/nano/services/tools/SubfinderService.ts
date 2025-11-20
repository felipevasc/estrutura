import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';

export class SubfinderService extends NanoService {
  initialize(): void {
    this.bus.on('COMMAND_RECEIVED', (payload) => {
      if (payload.command === 'subfinder') {
        this.processCommand(payload);
      }
    });

    this.bus.on('SUBFINDER_TERMINAL_RESULT', (payload) => this.processResult(payload));
    this.bus.on('SUBFINDER_TERMINAL_ERROR', (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { commandId, args, projectId } = payload;
    const idDominio = args.idDominio;

    this.log(`Processing Subfinder for domain ID: ${idDominio}`);

    try {
        const op = await prisma.dominio.findFirst({
            where: { id: Number(idDominio) }
        });
        const dominio = op?.endereco ?? "";

        const nomeArquivoSaida = `subfinder_resultado_${op?.projetoId}_${op?.id}_${dominio}_${Date.now()}.txt`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

        const comando = 'subfinder';
        const argumentos = ['-d', dominio, "--all", "-silent"];

        this.bus.emit('EXECUTE_TERMINAL', {
            executionId: commandId,
            command: comando,
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: 'SUBFINDER_TERMINAL_RESULT',
            errorTo: 'SUBFINDER_TERMINAL_ERROR',
            meta: { projectId, dominio, op }
        });

    } catch (e: any) {
        this.bus.emit('JOB_FAILED', {
            commandId,
            error: e.message
        });
    }
  }

  private async processResult(payload: any) {
      const { executionId, output, meta, command, args } = payload;
      const { op } = meta;

      this.log(`Processing result for ${executionId}`);

      try {
        const subdominios = output?.split("\n").filter((s: string) => !!s) ?? [];

        await Database.adicionarSubdominio(subdominios, op?.projetoId ?? 0);

        this.bus.emit('JOB_COMPLETED', {
            commandId: executionId,
            result: subdominios,
            rawOutput: output,
            executedCommand: `${command} ${args.join(' ')}`
        });

      } catch (e: any) {
          this.bus.emit('JOB_FAILED', {
              commandId: executionId,
              error: e.message
          });
      }
  }

  private processError(payload: any) {
      const { executionId, error } = payload;
      this.bus.emit('JOB_FAILED', {
          commandId: executionId,
          error: error
      });
  }
}
