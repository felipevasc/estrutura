import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import { TipoPorta } from '@/database/functions/ip';

export class NmapService extends NanoService {
  initialize(): void {
    this.listen('COMMAND_RECEIVED', (payload) => {
      if (payload.command === 'nmap') {
        this.processCommand(payload);
      }
    });

    this.listen('NMAP_TERMINAL_RESULT', (payload) => this.processResult(payload));
    this.listen('NMAP_TERMINAL_ERROR', (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { id, args, projectId } = payload;
    const idIp = args.idIp;

    this.log(`Processing Nmap for IP ID: ${idIp}`);

    try {
        const op = await prisma.ip.findFirst({
            where: { id: Number(idIp) }
        });
        const enderecoIp = op?.endereco ?? "";

        const nomeArquivoSaida = `nmap_resultado_${op?.projetoId}_${op?.id}_${enderecoIp}_${Date.now()}.txt`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

        const comando = 'nmap';
        const argumentos = ['-Pn', enderecoIp, "-p", "1-9999"];

        this.bus.emit('EXECUTE_TERMINAL', {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: 'NMAP_TERMINAL_RESULT',
            errorTo: 'NMAP_TERMINAL_ERROR',
            meta: { projectId, enderecoIp, op, idIp }
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
      const { op, idIp } = meta;

      this.log(`Processing result for ${jobId}`);

      try {
        const linhas = output?.split("\n").filter((s: string) => !!s) ?? [];
        const portas: TipoPorta[] = [];
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            if (linha.indexOf("open") < 0) {
            continue;
            }
            const tmp = linha.replace(/\t/g, " ").replace(/\s+/g, " ").split(" ")
            const tmp2 = tmp?.[0]?.trim()?.split("/");
            const porta = tmp2?.[0]?.trim();
            const protocolo = tmp2?.[1]?.trim();
            const servico = tmp?.[2]?.trim();
            if (porta) {
            portas.push({ porta: Number(porta), servico, versao: "", protocolo });
            }
        }
        await Database.adicionarPortas(portas, Number(idIp));

        this.bus.emit('JOB_COMPLETED', {
            id: jobId,
            result: portas,
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
