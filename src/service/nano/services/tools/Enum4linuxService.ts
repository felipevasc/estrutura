import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import { TipoUsuario } from '@/database/functions/usuario';

export class Enum4linuxService extends NanoService {
  initialize(): void {
    this.bus.on('COMMAND_RECEIVED', (payload) => {
      if (payload.command === 'enum4linux') {
        this.processCommand(payload);
      }
    });

    this.bus.on('ENUM4LINUX_TERMINAL_RESULT', (payload) => this.processResult(payload));
    this.bus.on('ENUM4LINUX_TERMINAL_ERROR', (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { commandId, args, projectId } = payload;
    const idIp = args.idIp;

    this.log(`Processing Enum4linux for IP ID: ${idIp}`);

    try {
        const ip = await prisma.ip.findFirst({
            where: { id: Number(idIp) }
        });
        const enderecoIp = ip?.endereco ?? "";

        const nomeArquivoSaida = `enum4linux_resultado_${ip?.projetoId}_${ip?.id}_${enderecoIp}_${Date.now()}.txt`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);

        const comando = 'enum4linux';
        const argumentos = ['-U', '-r', enderecoIp];

        this.bus.emit('EXECUTE_TERMINAL', {
            executionId: commandId,
            command: comando,
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: 'ENUM4LINUX_TERMINAL_RESULT',
            errorTo: 'ENUM4LINUX_TERMINAL_ERROR',
            meta: { projectId, enderecoIp, ip, idIp }
        });

    } catch (e: any) {
        this.bus.emit('JOB_FAILED', {
            commandId,
            error: e.message
        });
    }
  }

  private async processResult(payload: any) {
      const { executionId, output, meta, command, args } = payload;
      const { idIp } = meta;

      this.log(`Processing result for ${executionId}`);

      try {
        const linhas = output?.split("\n") ?? [];
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

        this.bus.emit('JOB_COMPLETED', {
            commandId: executionId,
            result: usuarios,
            rawOutput: output,
            executedCommand: `${command} ${args.join(' ')}`
        });

      } catch (e: any) {
          this.bus.emit('JOB_FAILED', {
              commandId: executionId,
              error: e.message
          });
      }
  }

  private processError(payload: any) {
      const { executionId, error } = payload;
      this.bus.emit('JOB_FAILED', {
          commandId: executionId,
          error: error
      });
  }
}
