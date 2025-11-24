import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import { TipoUsuario } from '@/database/functions/usuario';
import { NanoEvents } from '../../events';

export class Enum4linuxService extends NanoService {
  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'enum4linux') {
        this.processCommand(payload);
      }
    });

    this.listen(NanoEvents.ENUM4LINUX_TERMINAL_RESULT, (payload) => this.processResult(payload));
    this.listen(NanoEvents.ENUM4LINUX_TERMINAL_ERROR, (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { id, args, projectId } = payload;
    const idIp = args.idIp;

    this.log(`Processing Enum4linux for IP ID: ${idIp}`);

    try {
        const ip = await prisma.ip.findFirst({
            where: { id: Number(idIp) }
        });
        const enderecoIp = ip?.endereco ?? "";

        if (!enderecoIp) throw new Error('IP not found');

        const nomeArquivoSaida = `enum4linux_resultado_${ip?.projetoId}_${ip?.id}_${enderecoIp}_${Date.now()}.txt`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

        const comando = 'enum4linux';
        const argumentos = ['-U', '-r', enderecoIp];

        this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: NanoEvents.ENUM4LINUX_TERMINAL_RESULT,
            errorTo: NanoEvents.ENUM4LINUX_TERMINAL_ERROR,
            meta: { projectId, enderecoIp, ip, idIp }
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
      const { idIp } = meta;

      this.log(`Processing result for ${id}`);

      try {
        const linhas = stdout?.split("\n") ?? [];
        const usuarios: TipoUsuario[] = [];
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            let match = linha.match(/user:\[([^\[]*)\]/i);
            if (match?.[1]) {
                usuarios.push({ nome: match[1] });
            }
            match = linha.match(/.*\\(.*) \(Local User\)/i);
            if (match?.[1]) {
                usuarios.push({ nome: match[1] });
            }
        }
        await Database.adicionarUsuarios(usuarios, Number(idIp));

        this.bus.emit(NanoEvents.JOB_COMPLETED, {
            id: id,
            result: usuarios,
            rawOutput: stdout,
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
