import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import { TipoIp } from '@/database/functions/ip';

export class AmassService extends NanoService {
  initialize(): void {
    this.listen('COMMAND_RECEIVED', (payload) => {
      if (payload.command === 'amass') {
        this.processCommand(payload);
      }
    });

    this.listen('TERMINAL_RESULT', (payload) => {
        // We need to verify if this result belongs to AmassService
        // But wait, the EventBus is global. How do we filter?
        // In a real message bus, we would subscribe to a topic or check correlation ID.
        // Here we check the ID format or we just check if we have a pending job for this ID.
        // For simplicity, let's assume we check if we can parse it or if it's meant for us.
        // Ideally, we should store state "pendingJobs".

        // A better way is to have a specific event like 'AMASS_TERMINAL_RESULT' but TerminalService is generic.
        // So TerminalService emits 'TERMINAL_RESULT'.
        // We can check if the payload has a 'source' or 'tool' field if we passed it.
        // Let's add 'meta' to execute payload.
    });

    // To handle the correlation properly without state in the service (which might be lost if process restarts, though here it's in memory),
    // we can assume the NanoSystem is persistent during the request.
    // Since we are refactoring for "Nano Services", we should accept that they might be stateless.
    // So we need to persist the context.
    // But wait, the `processCommand` will trigger terminal, and then we need to pick up the result.

    // Let's actually implement a listener that checks the executionId.
    // We can use a map to store pending executions if we want, OR we can just inspect the payload.
    // However, `TerminalService` doesn't know about "amass".
    // So `AmassService` listens to `TERMINAL_RESULT` and checks if the executionId matches one it expects?
    // Or we can pass a 'callbackChannel' in the payload? 'AMASS_RESULT'.

    this.listen('AMASS_TERMINAL_RESULT', (payload) => this.processResult(payload));
    this.listen('AMASS_TERMINAL_ERROR', (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { id, args, projectId } = payload;
    const idDominio = args.idDominio;

    this.log(`Processing Amass for domain ID: ${idDominio}`);

    try {
        const op = await prisma.dominio.findFirst({
            where: { id: Number(idDominio) }
        });
        const dominio = op?.endereco ?? "";

        if (!op?.endereco || !this.validarDominio(dominio)) {
            throw new Error('Domínio inválido ou inseguro fornecido.');
        }

        const nomeArquivoSaida = `amass_resultado_${op?.projetoId}_${op?.id}_${dominio}_${Date.now()}.txt`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);
        const comando = 'amass';
        const argumentos = ['enum', '-d', dominio, '-timeout', "2", "2>&1"];

        // Emit to Terminal Service
        // We use a custom reply channel 'AMASS_TERMINAL_RESULT' so we don't conflict with other tools
        // Actually, TerminalService emits 'TERMINAL_RESULT'. We need to change TerminalService to support reply topics or we just filter.
        // Let's modify TerminalService to emit back to a specific event if provided.

        this.bus.emit('EXECUTE_TERMINAL', {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: 'AMASS_TERMINAL_RESULT', // New field
            errorTo: 'AMASS_TERMINAL_ERROR',   // New field
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
      const { projectId, dominio, op } = meta;

      this.log(`Processing result for ${jobId}`);

      try {
        const subdominios: string[] = [];
        const redes: string[] = [];
        const ips: TipoIp[] = [];

        const addElemento = (elemento: string, tipo: string, elementoAssociado: string, tipoAssociado: string) => {
            if (tipo === "FQDN") {
            subdominios.push(elemento);
            } else if (tipo === "IPAddress") {
            if (tipoAssociado === "FQDN") {
                ips.push({
                endereco: elemento,
                dominio: elementoAssociado,
                });
            }
            } else if (tipo === "Netblock") {
            redes.push(elemento);
            }
        }

        output?.split("\n").forEach((linha: string) => {
            const colunas = linha.split(" --> ");
            if (colunas.length === 3) {
            const tmp0 = colunas[0]?.trim()?.replaceAll(")", "").split("(");
            const ativoOrigem = tmp0[0].trim();
            const tipoAtivoOrigem = tmp0[1];

            const tmp1 = colunas[2].trim().replaceAll(")", "").split("(");
            // console.warn(tmp0, tmp1)
            const ativoDestino = tmp1[0].trim();
            const tipoAtivoDestino = tmp1[1].trim();

            // const relacao = colunas[1].trim();

            if (ativoOrigem.indexOf(dominio) > -1 || ativoDestino.indexOf(dominio) > -1) {
                addElemento(ativoOrigem, tipoAtivoOrigem, ativoDestino, tipoAtivoDestino);
                addElemento(ativoDestino, tipoAtivoDestino, ativoOrigem, tipoAtivoOrigem);
            }
            }
        });

        const tmp = {
            subdominios: subdominios.filter((i, idx) => idx === subdominios.findIndex((item) => item === i)).sort((a, b) => a.split(".").reverse().join(".") > b.split(".").reverse().join(".") ? 1 : -1),
            ips: ips.filter((i, idx) => idx === ips.findIndex((item) => item === i)).sort(),
            redes: redes.filter((i, idx) => idx === redes.findIndex((item) => item === i)).sort(),
        }

        await Database.adicionarSubdominio(tmp.subdominios, op?.projetoId ?? 0);
        await Database.adicionarIp(tmp.ips, op?.projetoId ?? 0);

        this.bus.emit('JOB_COMPLETED', {
            id: jobId,
            result: tmp,
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

  private validarDominio(dominio: string): boolean {
    const regexDominio = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
    return regexDominio.test(dominio);
  }
}
