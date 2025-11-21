import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import { TipoIp } from '@/database/functions/ip';

export class NslookupService extends NanoService {
  initialize(): void {
    this.listen('COMMAND_RECEIVED', (payload) => {
      if (payload.command === 'nslookup') {
        this.processCommand(payload);
      }
    });

    this.listen('NSLOOKUP_TERMINAL_RESULT', (payload) => this.processResult(payload));
    this.listen('NSLOOKUP_TERMINAL_ERROR', (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { id, args, projectId } = payload;
    const idDominio = args.idDominio;

    this.log(`Processing Nslookup for domain ID: ${idDominio}`);

    try {
        const op = await prisma.dominio.findFirst({
            where: { id: Number(idDominio) }
        });
        const dominio = op?.endereco ?? "";

        const nomeArquivoSaida = `nslookup_resultado_${op?.projetoId}_${op?.id}_${dominio}_${Date.now()}.txt`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

        const comando = 'nslookup';
        const argumentos = ['-debug', dominio, "1.1.1.1"];

        this.bus.emit('EXECUTE_TERMINAL', {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: 'NSLOOKUP_TERMINAL_RESULT',
            errorTo: 'NSLOOKUP_TERMINAL_ERROR',
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
      const { executionId, id, output, meta, command, args } = payload;
      const jobId = id ?? executionId;
      const { op, dominio } = meta;

      this.log(`Processing result for ${jobId}`);

      try {
        const linhas = output?.split("\n").filter((s: string) => !!s) ?? [];
        const ips: TipoIp[] = [];
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            if (linha.indexOf("internet address") < 0) {
            continue;
            }
            const tmp = linha.split("=")
            const ip = tmp?.[1]?.trim();
            if (ip) {
            ips.push({ endereco: ip, dominio: dominio });
            }
        }

        await Database.adicionarIp(ips, op?.projetoId ?? 0);

        this.bus.emit('JOB_COMPLETED', {
            id: jobId,
            result: ips,
            rawOutput: output,
            executedCommand: `${command} ${args.join(' ')}`
        });

      } catch (e: any) {
          this.bus.emit('JOB_FAILED', {
              id: jobId,
              error: e.message
          });
      }
  }

  private processError(payload: any) {
      const { executionId, id, error } = payload;
      this.bus.emit('JOB_FAILED', {
          id: id ?? executionId,
          error: error
      });
  }
}
