import { NanoService } from '../../NanoService';
import EventBus from '../../EventBus';
import prisma from '@/database';
import fs from 'fs';

export class FfufService extends NanoService {
  constructor() {
    super();
  }

  initialize(): void {
    this.listen('COMMAND_RECEIVED', this.handleCommand.bind(this));
    this.listen('FFUF_RESULT', this.handleResult.bind(this));
  }

  private async handleCommand(payload: any) {
    if (payload.command !== 'ffuf') return;

    console.log(`[FfufService] Handling command for project ${payload.projectId}`);

    let args: any;
    try {
        args = typeof payload.args === 'string' ? JSON.parse(payload.args) : payload.args;
    } catch (e) {
        console.error('[FfufService] Failed to parse args JSON', e);
        EventBus.emit('JOB_FAILED', { id: payload.id, error: 'Invalid arguments' });
        return;
    }

    let dominio = null;
    let ip = null;
    let target = '';

    if (args.idDominio) {
        dominio = await prisma.dominio.findUnique({ where: { id: parseInt(args.idDominio) } });
    } else if (args.idIp) {
        ip = await prisma.ip.findUnique({ where: { id: parseInt(args.idIp) } });
    }

    if (!dominio && !ip) {
        console.error('[FfufService] Target not found');
        EventBus.emit('JOB_FAILED', { id: payload.id, error: 'Target not found' });
        return;
    }

    target = dominio ? dominio.endereco : (ip ? ip.endereco : '');

    if (!target.startsWith('http')) {
        target = `http://${target}`;
    }

    const wordlistPath = `/tmp/wordlist_${payload.id}.txt`;
    const dummyWordlist = `admin
login
test
dev
backup
robot.txt
sitemap.xml
api
dashboard
config`;

    fs.writeFileSync(wordlistPath, dummyWordlist);

    const cmd = `ffuf -u ${target}/FUZZ -w ${wordlistPath} -o - -of json`;

    EventBus.emit('EXECUTE_TERMINAL', {
      command: cmd,
      replyTo: 'FFUF_RESULT',
      errorTo: 'JOB_FAILED',
      id: payload.id
    });
  }

  private async handleResult(payload: any) {
    console.log('[FfufService] Processing result');

    try {
        const output = payload.output;

        let data;
        try {
             data = JSON.parse(output);
        } catch (e) {
             // If output is not valid JSON (e.g. ffuf banner mixed in), try to find the JSON part or fail gracefully
             console.warn('[FfufService] Output is not pure JSON, attempting to extract');
             // Sometimes tools output logs then JSON.
             // For now, if it fails, we might fail the job or try to regex the JSON.
             // Assuming standard behavior with -o - -of json
             EventBus.emit('JOB_FAILED', { id: payload.id, error: 'Invalid JSON output from ffuf' });
             return;
        }

        const results = data.results;

        if (results && Array.isArray(results)) {
            const commandRecord = await prisma.command.findUnique({ where: { id: payload.id } });

            if (!commandRecord) {
                console.error('[FfufService] Command record not found');
                return;
            }

            let args: any;
            try {
                args = JSON.parse(commandRecord.args);
            } catch (e) {
                // Fallback if args was saved as raw string (legacy behavior support?)
                // But we know we sent JSON.
                 console.error('[FfufService] Failed to parse stored args');
                 return;
            }

            let dominio = null;
            let ip = null;

            if (args.idDominio) {
                dominio = await prisma.dominio.findUnique({ where: { id: parseInt(args.idDominio) } });
            } else if (args.idIp) {
                ip = await prisma.ip.findUnique({ where: { id: parseInt(args.idIp) } });
            }

            for (const res of results) {
                const path = res.input.FUZZ;
                const status = res.status;
                const size = res.length;

                await prisma.diretorio.create({
                    data: {
                        caminho: path,
                        status: status,
                        tamanho: size,
                        dominioId: dominio ? dominio.id : null,
                        ipId: ip ? ip.id : null
                    }
                });
            }
        }

        // Clean up wordlist
        const wordlistPath = `/tmp/wordlist_${payload.id}.txt`;
        if (fs.existsSync(wordlistPath)) {
            fs.unlinkSync(wordlistPath);
        }

        EventBus.emit('JOB_COMPLETED', { id: payload.id, output: payload.output });

    } catch (e) {
        console.error('[FfufService] Error processing result:', e);
        EventBus.emit('JOB_FAILED', { id: payload.id, error: String(e) });
    }
  }
}
