import { NanoService } from '../../NanoService';
import prisma from '@/database';
import fs from 'fs';
import path from 'node:path';
import os from 'node:os';

export class FfufService extends NanoService {
  initialize(): void {
    this.listen('COMMAND_RECEIVED', (payload) => {
      if (payload.command === 'ffuf') {
        this.processCommand(payload);
      }
    });
    this.listen('FFUF_RESULT', (payload) => this.processResult(payload));
    this.listen('FFUF_ERROR', (payload) => this.processError(payload));
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

        const wordlistPath = path.join(os.tmpdir(), `wordlist_${id}.txt`);
        // Expanded dummy wordlist for dev/POC
        const dummyWordlist = `admin
login
test
dev
backup
robots.txt
sitemap.xml
api
dashboard
config
.env
wp-admin`;

        fs.writeFileSync(wordlistPath, dummyWordlist);

        const outputPath = path.join(os.tmpdir(), `ffuf_output_${id}_${Date.now()}.json`);

        // -o output to file, -of json format
        // We also output to stdout (default behavior of ffuf if -o is not -)
        // But TerminalService writes stdout to file if outputFile is set.
        // Ffuf: -o file writes to file. -o - writes to stdout.
        // TerminalService expects output on stdout to capture it in memory.
        // So we use -o - to print to stdout, and TerminalService will capture it and write to its own log file.

        this.bus.emit('EXECUTE_TERMINAL', {
            id: id,
            command: 'ffuf',
            args: ['-u', `${target}/FUZZ`, '-w', wordlistPath, '-o', '-', '-of', 'json'],
            outputFile: outputPath, // TerminalService saves the raw text output here
            replyTo: 'FFUF_RESULT',
            errorTo: 'FFUF_ERROR',
            meta: { projectId, dominio, ip, wordlistPath }
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
    const { dominio, ip, wordlistPath } = meta;

    this.log(`Processing result for ${id}`);

    try {
        // Try to find JSON in the output (stdout)
        // Ffuf with -of json prints a valid JSON object.
        // However, sometimes there might be other text.
        // We look for the first '{' and last '}'
        const start = stdout.indexOf('{');
        const end = stdout.lastIndexOf('}');

        if (start === -1 || end === -1) {
            throw new Error('No JSON found in output');
        }

        const jsonStr = stdout.substring(start, end + 1);
        const data = JSON.parse(jsonStr);
        const results = data.results;

        if (results && Array.isArray(results)) {
            for (const res of results) {
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

        // Clean up wordlist
        if (fs.existsSync(wordlistPath)) {
            fs.unlinkSync(wordlistPath);
        }

        this.bus.emit('JOB_COMPLETED', {
            id: id,
            result: results, // Store parsed results
            rawOutput: stdout,
            executedCommand: `${command} ${args.join(' ')}`
        });

    } catch (e: any) {
        this.error(`Error processing result: ${e.message}`);

        // Clean up wordlist even on error
        if (wordlistPath && fs.existsSync(wordlistPath)) {
            fs.unlinkSync(wordlistPath);
        }

        this.bus.emit('JOB_FAILED', { id: id, error: e.message });
    }
  }

  private processError(payload: any) {
      const { id, error, meta } = payload;
      const { wordlistPath } = meta || {};

      if (wordlistPath && fs.existsSync(wordlistPath)) {
          fs.unlinkSync(wordlistPath);
      }

      this.bus.emit('JOB_FAILED', {
          id: id,
          error: error
      });
  }
}
