import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { TipoPorta } from '@/database/functions/ip';
import { NanoEvents } from '../../events';

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

    this.log(`Processing Nmap for IP ID: ${idIp}`);

    try {
        const op = await prisma.ip.findFirst({
            where: { id: Number(idIp) }
        });
        const enderecoIp = op?.endereco ?? "";

        if (!enderecoIp) throw new Error('IP not found');

        // We will use -oG (Grepable Output) because it's easier to parse reliably than the text table
        // and simpler than XML.
        const outputPrefix = path.join(os.tmpdir(), `nmap_${op?.projetoId}_${id}_${Date.now()}`);
        const grepOutput = `${outputPrefix}.gnmap`;
        const stdoutFile = `${outputPrefix}.stdout`;

        const comando = 'nmap';
        // -Pn: treat as up
        // -oG: Grepable output
        // -p 1-65535: scan all ports (changed from 1-9999 to be more thorough, or keep 1-9999 if perf is concern)
        // Let's stick to standard full range or top ports. User had 1-9999.
        const argumentos = ['-Pn', enderecoIp, "-p", "1-9999", "-oG", grepOutput];

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
            const lines = content.split('\n');

            for (const line of lines) {
                // Grepable output format:
                // Host: 127.0.0.1 ()	Ports: 22/open/tcp//ssh///, 80/open/tcp//http///
                if (line.startsWith('#') || !line.includes('Ports:')) continue;

                const parts = line.split('Ports:');
                if (parts.length < 2) continue;

                const portData = parts[1].trim();
                // 22/open/tcp//ssh///, 80/open/tcp//http///
                const portEntries = portData.split(', ');

                for (const entry of portEntries) {
                    // Format: Port/State/Protocol/Owner/Service/RPC info/Version info/
                    const fields = entry.split('/');
                    if (fields.length >= 3) {
                        const portNum = parseInt(fields[0], 10);
                        const state = fields[1];
                        const protocol = fields[2];
                        const service = fields[4] || "";

                        if (state === 'open' && !isNaN(portNum)) {
                            portas.push({
                                porta: portNum,
                                servico: service,
                                versao: "",
                                protocolo: protocol
                            });
                        }
                    }
                }
            }
            fs.unlinkSync(grepOutput);
        } else {
            // Fallback to stdout parsing if file missing (shouldn't happen)
            // or just log warning
            this.log("Warning: Nmap grepable output missing.");
        }

        if (fs.existsSync(stdoutFile)) {
             fs.unlinkSync(stdoutFile);
        }

        await Database.adicionarPortas(portas, Number(idIp));

        this.bus.emit(NanoEvents.JOB_COMPLETED, {
            id: id,
            result: portas,
            rawOutput: "Output stored in DB", // We don't keep the huge output in JSON
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
