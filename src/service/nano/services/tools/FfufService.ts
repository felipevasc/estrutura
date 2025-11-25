import { NanoService } from '../../NanoService';
import prisma from '@/database';
import fs from 'fs';
import path from 'node:path';
import os from 'node:os';
import { NanoEvents } from '../../events';

export class FfufService extends NanoService {
  constructor() {
    super('FfufService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'ffuf') {
        this.processCommand(payload);
      }
    });
    this.listen(NanoEvents.FFUF_RESULT, (payload) => this.processResult(payload));
    this.listen(NanoEvents.FFUF_ERROR, (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { id, args, projectId } = payload;
    this.log(`Processing Ffuf for project ${projectId}`);

    try {
        let dominio = null;
        let ip = null;
        let target = '';

        if (args.idDominio) {
            dominio = await prisma.dominio.findUnique({ where: { id: parseInt(args.idDominio) } });
        } else if (args.idIp) {
            ip = await prisma.ip.findUnique({ where: { id: parseInt(args.idIp) } });
        }

        if (!dominio && !ip) {
            throw new Error('Target not found');
        }

        target = dominio ? dominio.endereco : (ip ? ip.endereco : '');

        if (!target.startsWith('http')) {
            target = `http://${target}`;
        }

        // TODO: Make wordlist configurable
        const wordlistPath = "/usr/share/wordlists/dirb/common.txt";

        // Output path for the JSON results (ffuf writes here)
        const jsonOutputPath = path.join(os.tmpdir(), `ffuf_results_${id}_${Date.now()}.json`);

        // Output path for the terminal logs (TerminalService writes stdout/stderr here)
        const logOutputPath = path.join(os.tmpdir(), `ffuf_log_${id}_${Date.now()}.txt`);

        this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
            id: id,
            command: 'ffuf',
            // We use -o to write results to the JSON file.
            // TerminalService will still capture stdout/stderr to logOutputPath.
            args: ['-u', `${target}/FUZZ`, '-w', wordlistPath, '-o', jsonOutputPath, '-of', 'json'],
            outputFile: logOutputPath,
            replyTo: NanoEvents.FFUF_RESULT,
            errorTo: NanoEvents.FFUF_ERROR,
            meta: { projectId, dominio, ip, wordlistPath, jsonOutputPath, logOutputPath }
        });

    } catch (e: any) {
        this.bus.emit(NanoEvents.JOB_FAILED, {
            id: id,
            error: e.message
        });
    }
  }

  private async processResult(payload: any) {
    const { id, stdout, meta, command, args } = payload;
    const { dominio, ip, jsonOutputPath, logOutputPath } = meta;

    this.log(`Processing result for ${id}`);

    try {
        if (!fs.existsSync(jsonOutputPath)) {
             // Check if it failed but created log
             if (fs.existsSync(logOutputPath)) {
                 const log = fs.readFileSync(logOutputPath, 'utf8');
                 throw new Error(`Ffuf did not generate JSON output. Log: ${log.slice(0, 500)}`);
             }
             throw new Error(`JSON output file not found at ${jsonOutputPath}`);
        }

        const jsonStr = fs.readFileSync(jsonOutputPath, 'utf8');
        let data;
        try {
            data = JSON.parse(jsonStr);
        } catch (parseError: any) {
            throw new Error(`Failed to parse JSON from ${jsonOutputPath}: ${parseError.message}`);
        }

        const results = data.results;

        if (results && Array.isArray(results) && results.length > 0) {
            // Filter logic: remove majority group based on status and size
            const stats = new Map<string, number>();
            results.forEach((res: any) => {
                const key = `${res.status}-${res.length}`;
                stats.set(key, (stats.get(key) || 0) + 1);
            });

            let majorityKey = '';
            let maxCount = -1;
            stats.forEach((count, key) => {
                if (count > maxCount) {
                    maxCount = count;
                    majorityKey = key;
                }
            });

            let filteredResults = results;
            if (maxCount > 1) {
                filteredResults = results.filter((res: any) => {
                    const key = `${res.status}-${res.length}`;
                    return key !== majorityKey;
                });
            }

            this.log(`Filtered ${results.length - filteredResults.length} items from ${results.length} total results.`);

            for (const res of filteredResults) {
                const pathFound = res.input.FUZZ;
                const status = res.status;
                const size = res.length;

                await prisma.diretorio.create({
                    data: {
                        caminho: pathFound,
                        status: status,
                        tamanho: size,
                        dominioId: dominio ? dominio.id : null,
                        ipId: ip ? ip.id : null
                    }
                });
            }
        }

        // Clean up files
        if (fs.existsSync(jsonOutputPath)) fs.unlinkSync(jsonOutputPath);
        if (fs.existsSync(logOutputPath)) fs.unlinkSync(logOutputPath);


        this.bus.emit(NanoEvents.JOB_COMPLETED, {
            id: id,
            result: results,
            rawOutput: stdout,
            executedCommand: `${command} ${args.join(' ')}`
        });

    } catch (e: any) {
        this.error(`Error processing result: ${e.message}`);

        // Try to read log file to give more info
        let logContent = "";
        if (logOutputPath && fs.existsSync(logOutputPath)) {
            logContent = fs.readFileSync(logOutputPath, 'utf8');
            fs.unlinkSync(logOutputPath);
        }
        if (jsonOutputPath && fs.existsSync(jsonOutputPath)) {
             fs.unlinkSync(jsonOutputPath);
        }

        this.bus.emit(NanoEvents.JOB_FAILED, { id: id, error: `${e.message}. Log: ${logContent.slice(0, 1000)}` });
    }
  }

  private processError(payload: any) {
      const { id, error, meta } = payload;
      const { jsonOutputPath, logOutputPath } = meta || {};

      // Clean up files
      if (jsonOutputPath && fs.existsSync(jsonOutputPath)) fs.unlinkSync(jsonOutputPath);
      if (logOutputPath && fs.existsSync(logOutputPath)) fs.unlinkSync(logOutputPath);

      this.bus.emit(NanoEvents.JOB_FAILED, {
          id: id,
          error: error
      });
  }
}
