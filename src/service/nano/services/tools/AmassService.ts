import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { TipoIp } from '@/database/functions/ip';
import { NanoEvents } from '../../events';

export class AmassService extends NanoService {
  constructor() {
    super('AmassService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'amass') {
        this.processCommand(payload);
      }
    });

    this.listen(NanoEvents.AMASS_TERMINAL_RESULT, (payload) => this.processResult(payload));
    this.listen(NanoEvents.AMASS_TERMINAL_ERROR, (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { id, args, projectId } = payload;
    const idDominio = args.idDominio;
    const timeout = Number(args.timeoutMinutos || 5);

    this.log(`Processing Amass for domain ID: ${idDominio}`);

    try {
        const op = await prisma.dominio.findFirst({
            where: { id: Number(idDominio) }
        });
        const dominio = op?.endereco ?? "";

        if (!op?.endereco || !this.validarDominio(dominio)) {
            throw new Error('Domínio inválido ou inseguro fornecido.');
        }

        // JSON output file
        const jsonOutputFile = path.join(os.tmpdir(), `amass_${op?.projetoId}_${id}_${Date.now()}.json`);
        // Log file for stdout/stderr (mostly progress bars or errors)
        const logOutputFile = path.join(os.tmpdir(), `amass_log_${op?.projetoId}_${id}_${Date.now()}.txt`);

        const comando = 'amass';
        // Use -json output for reliable parsing
        // -timeout 15 (minutes) is better than 2 if we want real results, but let's stick to 2 if it was intentional.
        // Actually, let's assume 5 mins.
        const argumentos = ['enum', '-d', dominio, '-timeout', timeout > 0 ? `${timeout}` : "5", '-json', jsonOutputFile];

        this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: logOutputFile,
            replyTo: NanoEvents.AMASS_TERMINAL_RESULT,
            errorTo: NanoEvents.AMASS_TERMINAL_ERROR,
            meta: { projectId, dominio, op, jsonOutputFile, logOutputFile }
        });

    } catch (e: any) {
        this.bus.emit(NanoEvents.JOB_FAILED, {
            id: id,
            error: e.message
        });
    }
  }

  private async processResult(payload: any) {
      const { executionId, id, output, meta, command, args } = payload;
      const jobId = id ?? executionId;
      const { op, jsonOutputFile, logOutputFile } = meta;

      this.log(`Processing result for ${jobId}`);

      try {
        const subdominios: string[] = [];
        const ips: TipoIp[] = [];

        // Read JSON output
        if (fs.existsSync(jsonOutputFile)) {
            const content = fs.readFileSync(jsonOutputFile, 'utf-8');
            // Amass writes one JSON object per line
            const lines = content.split('\n').filter(l => l.trim());

            for (const line of lines) {
                try {
                    const item = JSON.parse(line);
                    // Amass JSON structure:
                    // { "name": "sub.example.com", "domain": "example.com", "addresses": [ { "ip": "1.2.3.4", "cidr": "...", "asn": ... } ] }

                    if (item.name) {
                        subdominios.push(item.name);
                    }

                    if (item.addresses && Array.isArray(item.addresses)) {
                        for (const addr of item.addresses) {
                            if (addr.ip) {
                                ips.push({
                                    endereco: addr.ip,
                                    dominio: item.name || item.domain // Link IP to the subdomain found
                                });
                            }
                        }
                    }
                } catch (e) {
                    // ignore parse error for single line
                }
            }

            // Cleanup
            fs.unlinkSync(jsonOutputFile);
        } else {
            this.log('Warning: No JSON output file found from Amass. Maybe no results?');
        }

        // Cleanup log file
        if (fs.existsSync(logOutputFile)) {
            fs.unlinkSync(logOutputFile);
        }

        const uniqueSubs = [...new Set(subdominios)];
        // Sort and filter unique IPs
        const uniqueIps = ips.filter((v, i, a) => a.findIndex(t => t.endereco === v.endereco && t.dominio === v.dominio) === i);

        if (uniqueSubs.length > 0) {
             await Database.adicionarSubdominio(uniqueSubs, op?.projetoId ?? 0);
        }
        if (uniqueIps.length > 0) {
             await Database.adicionarIp(uniqueIps, op?.projetoId ?? 0);
        }

        this.bus.emit(NanoEvents.JOB_COMPLETED, {
            id: jobId,
            result: { subdominios: uniqueSubs, ips: uniqueIps },
            rawOutput: output,
            executedCommand: `${command} ${args.join(' ')}`
        });

      } catch (e: any) {
          // Cleanup on error
          if (jsonOutputFile && fs.existsSync(jsonOutputFile)) fs.unlinkSync(jsonOutputFile);
          if (logOutputFile && fs.existsSync(logOutputFile)) fs.unlinkSync(logOutputFile);

          this.bus.emit(NanoEvents.JOB_FAILED, {
              id: jobId,
              error: e.message
          });
      }
  }

  private processError(payload: any) {
      const { executionId, id, error, meta } = payload;
      const { jsonOutputFile, logOutputFile } = meta || {};

      if (jsonOutputFile && fs.existsSync(jsonOutputFile)) fs.unlinkSync(jsonOutputFile);
      if (logOutputFile && fs.existsSync(logOutputFile)) fs.unlinkSync(logOutputFile);

      this.bus.emit(NanoEvents.JOB_FAILED, {
          id: id ?? executionId,
          error: error
      });
  }

  private validarDominio(dominio: string): boolean {
    const regexDominio = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
    return regexDominio.test(dominio);
  }
}
