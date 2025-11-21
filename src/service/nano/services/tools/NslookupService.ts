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

        if (!dominio) throw new Error('Domain not found');

        const nomeArquivoSaida = `nslookup_resultado_${op?.projetoId}_${op?.id}_${dominio}_${Date.now()}.txt`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

        const comando = 'nslookup';
        // Use Google DNS to avoid local DNS caching/restrictions
        const argumentos = ['-debug', dominio, "8.8.8.8"];

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
      const { id, stdout, meta, command, args } = payload;
      const { op, dominio } = meta;

      this.log(`Processing result for ${id}`);

      try {
        const linhas = stdout?.split("\n").filter((s: string) => !!s) ?? [];
        const ips: TipoIp[] = [];
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            // nslookup output format varies, but standard is "Address: <ip>"
            // or "Name: <domain>\nAddress: <ip>"
            // The existing parser looked for "internet address =". Wait, that looks like `dig` or a specific nslookup version?
            // Standard Linux nslookup:
            // Address: 1.2.3.4
            //
            // However, the code had: `if (linha.indexOf("internet address") < 0)`
            // This implies a specific version or maybe `host` command was intended?
            // Or `nslookup -debug` output format.

            // Let's support standard "Address: "
            if (linha.toLowerCase().includes("address:")) {
                const parts = linha.split(":");
                if (parts.length > 1) {
                    const ip = parts[1].trim();
                    // Filter out the DNS server address (often ends with #53)
                    if (!ip.includes('#') && ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
                         ips.push({ endereco: ip, dominio: dominio });
                    }
                }
            }
        }

        await Database.adicionarIp(ips, op?.projetoId ?? 0);

        this.bus.emit('JOB_COMPLETED', {
            id: id,
            result: ips,
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
