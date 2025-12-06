import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import { TipoDominio } from '@prisma/client';
import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import { NanoEvents } from '../../events';

export class SubfinderService extends NanoService {
  constructor() {
    super('SubfinderService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'subfinder') {
        this.processCommand(payload);
      }
    });

    this.listen(NanoEvents.SUBFINDER_TERMINAL_RESULT, (payload) => this.processResult(payload));
    this.listen(NanoEvents.SUBFINDER_TERMINAL_ERROR, (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { id, args, projectId } = payload;
    const idDominio = args.idDominio;
    const todasFontes = args.todasFontes !== false;
    const modoSilencioso = args.modoSilencioso !== false;

    this.log(`Processing Subfinder for domain ID: ${idDominio}`);

    try {
        const op = await prisma.dominio.findFirst({
            where: { id: Number(idDominio) }
        });
        const dominio = op?.endereco ?? "";

        if (!dominio) throw new Error('Domain not found');

        const nomeArquivoSaida = `subfinder_resultado_${op?.projetoId}_${op?.id}_${dominio}_${Date.now()}.txt`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

        const comando = 'subfinder';
        const argumentosBase = ['-d', dominio, "-o", caminhoSaida];
        if (todasFontes) argumentosBase.push("--all");
        if (modoSilencioso) argumentosBase.push("-silent");
        const argumentos = argumentosBase;

        this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: NanoEvents.SUBFINDER_TERMINAL_RESULT,
            errorTo: NanoEvents.SUBFINDER_TERMINAL_ERROR,
            meta: { projectId, dominio, op }
        });

    } catch (e: any) {
        this.bus.emit(NanoEvents.JOB_FAILED, {
            id: id,
            error: e.message
        });
    }
  }

  private async processResult(payload: any) {
    const { id, outputFile, meta, command, args } = payload;
    const { op } = meta;
    this.log(`Processing result for ${id} from file ${outputFile}`);
    try {
      const fileContent = await fs.readFile(outputFile, 'utf-8');
      await fs.unlink(outputFile);
      const subdominios = fileContent?.split("\n").map((s: string) => s.trim()).filter((s: string) => !!s && s.includes('.')) ?? [];
      await Database.adicionarSubdominio(subdominios, op?.projetoId ?? 0, TipoDominio.dns);
      this.bus.emit(NanoEvents.JOB_COMPLETED, {
          id: id,
          result: subdominios,
          rawOutput: fileContent,
          executedCommand: `${command} ${args.join(' ')}`
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
