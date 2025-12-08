import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import { TipoIp } from '@/database/functions/ip';
import { NanoEvents } from '../../events';

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
  stdout?: string;
  meta: any;
  command?: string;
  args?: string[];
  error?: string;
}

export class NslookupService extends NanoService {
  constructor() {
    super('NslookupService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload: any) => {
      if (payload.command === 'nslookup') {
        this.processCommand(payload as CommandPayload);
      }
    });

    this.listen(NanoEvents.NSLOOKUP_TERMINAL_RESULT, (payload: any) => this.processResult(payload as TerminalResultPayload));
    this.listen(NanoEvents.NSLOOKUP_TERMINAL_ERROR, (payload: any) => this.processError(payload as TerminalResultPayload));
  }

  private async processCommand(payload: CommandPayload) {
    const { id, args, projectId } = payload;
    const idDominio = args.idDominio;
    const servidorDns = args.servidorDns || "8.8.8.8";

    this.log(`Processing Nslookup for domain ID: ${idDominio}`);

    try {
        const op = await prisma.dominio.findFirst({
            where: { id: Number(idDominio) }
        });
        const dominio = op?.endereco ?? "";

        if (!dominio) throw new Error('Domain not found');

        const nomeArquivoSaida = `nslookup_resultado_${op?.projetoId}_${op?.id}_${dominio}_${Date.now()}.txt`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

        const comando = 'nslookup';
        // Use Google DNS to avoid local DNS caching/restrictions
        // removed -debug to make parsing easier and standard.
        const argumentos = [dominio, servidorDns];

        this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: NanoEvents.NSLOOKUP_TERMINAL_RESULT,
            errorTo: NanoEvents.NSLOOKUP_TERMINAL_ERROR,
            meta: { projectId, dominio, op }
        });

    } catch (e: unknown) {
        this.bus.emit(NanoEvents.JOB_FAILED, {
            id: id,
            error: (e as Error).message || String(e)
        });
    }
  }

  private async processResult(payload: TerminalResultPayload) {
      const { id, stdout, meta, command, args } = payload;
      const { op, dominio } = meta;

      this.log(`Processing result for ${id}`);

      try {
        const linhas = stdout?.split("\n").filter((s: string) => !!s) ?? [];
        const ips: TipoIp[] = [];
        for (const linha of linhas) {
            // Standard Linux nslookup output for `nslookup domain 8.8.8.8`:
            // Server:		8.8.8.8
            // Address:	8.8.8.8#53
            //
            // Non-authoritative answer:
            // Name:	google.com
            // Address: 142.250.217.78
            // Name:	google.com
            // Address: 2607:f8b0:400a:80b::200e

            // We look for "Address: " that does NOT contain '#' (which is usually the DNS server port)
            const lower = linha.toLowerCase();
            if (lower.startsWith("address:") || lower.includes("address:")) {
                const parts = linha.split(":");
                if (parts.length >= 2) {
                    const ip = parts[1].trim();
                    // Filter out the DNS server address (often ends with #53) and verify it's an IPv4
                    if (!ip.includes('#') && ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
                         ips.push({ endereco: ip, dominio: dominio });
                    }
                }
            }
        }

        // Filter unique IPs
        const uniqueIps = ips.filter((v, i, a) => a.findIndex(t => t.endereco === v.endereco) === i);

        if (uniqueIps.length > 0) {
             await Database.adicionarIp(uniqueIps, op?.projetoId ?? 0);
        }

        this.bus.emit(NanoEvents.JOB_COMPLETED, {
            id: id!,
            result: uniqueIps,
            rawOutput: stdout,
            executedCommand: `${command} ${(args as any).join(' ')}`
        });

      } catch (e: unknown) {
          this.bus.emit(NanoEvents.JOB_FAILED, {
              id: id!,
              error: (e as Error).message || String(e)
          });
      }
  }

  private processError(payload: TerminalResultPayload) {
      const { id, error } = payload;
      this.bus.emit(NanoEvents.JOB_FAILED, {
          id: id!,
          error: error
      });
  }
}
