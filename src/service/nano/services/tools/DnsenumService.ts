import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { NanoEvents } from '../../events';
import { TipoIp } from '@/database/functions/ip';

export class DnsenumService extends NanoService {
  constructor() {
    super('DnsenumService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'dnsenum') {
        this.processCommand(payload);
      }
    });

    this.listen(NanoEvents.DNSENUM_TERMINAL_RESULT, (payload) => this.processResult(payload));
    this.listen(NanoEvents.DNSENUM_TERMINAL_ERROR, (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { id, args, projectId } = payload;
    const { idDominio, threads, wordlist } = args;

    this.log(`Processing Dnsenum for domain ID: ${idDominio}`);

    try {
        const op = await prisma.dominio.findFirst({
            where: { id: Number(idDominio) }
        });
        const dominio = op?.endereco ?? "";

        if (!dominio) throw new Error('Domain not found');

        const nomeArquivoSaida = `dnsenum_${projectId}_${id}_${Date.now()}.xml`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

        // dnsenum [options] <domain>
        // -o <file> Output to XML file.
        // -f <file> Read subdomains from this file (if provided)
        // --threads <int>
        // --noreverse

        const commandArgs = [
             '--noreverse',
             '-o', caminhoSaida,
             '--threads', String(threads || 5)
        ];

        if (wordlist) {
            commandArgs.push('-f', wordlist);
        }

        commandArgs.push(dominio);

        this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
            id: id,
            command: 'dnsenum',
            args: commandArgs,
            outputFile: caminhoSaida,
            replyTo: NanoEvents.DNSENUM_TERMINAL_RESULT,
            errorTo: NanoEvents.DNSENUM_TERMINAL_ERROR,
            meta: { projectId, dominio, outputFile: caminhoSaida }
        });

    } catch (e: any) {
        this.bus.emit(NanoEvents.JOB_FAILED, {
            id: id,
            error: e.message
        });
    }
  }

  private async processResult(payload: any) {
      const { id, meta } = payload;
      const { projectId, outputFile } = meta;

      try {
        if (!fs.existsSync(outputFile)) {
             throw new Error('Output file not found');
        }

        const xmlContent = fs.readFileSync(outputFile, 'utf-8');

        // Simple Regex Parsing
        // <host>
        //   <hostname>xxx</hostname>
        //   <ip>xxx</ip>
        // </host>

        const hostRegex = /<host>([\s\S]*?)<\/host>/g;
        let match;
        const subdominios: string[] = [];
        const ips: TipoIp[] = [];

        while ((match = hostRegex.exec(xmlContent)) !== null) {
            const content = match[1];
            const hostnameMatch = /<hostname>(.*?)<\/hostname>/.exec(content);

            if (hostnameMatch) {
                const host = hostnameMatch[1].trim();
                subdominios.push(host);

                const ipRegex = /<ip>(.*?)<\/ip>/g;
                let ipM;
                while ((ipM = ipRegex.exec(content)) !== null) {
                    const ip = ipM[1].trim();
                     // Filter valid IPs (IPv4)
                    if (ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
                         ips.push({ endereco: ip, dominio: host });
                    }
                }
            }
        }

        if (subdominios.length > 0) {
            await Database.adicionarSubdominio(subdominios, projectId);
        }

        if (ips.length > 0) {
             await Database.adicionarIp(ips, projectId);
        }

        // Cleanup
        try {
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
        } catch (e) {
            console.error('Error deleting temp file:', e);
        }

        this.bus.emit(NanoEvents.JOB_COMPLETED, {
            id: id,
            result: { subdominios: subdominios.length, ips: ips.length }
        });

      } catch (e: any) {
          this.bus.emit(NanoEvents.JOB_FAILED, {
              id: id,
              error: e.message
          });
      }
  }

  private processError(payload: any) {
      const { id, error } = payload;
      this.bus.emit(NanoEvents.JOB_FAILED, {
          id: id,
          error: error
      });
  }
}
