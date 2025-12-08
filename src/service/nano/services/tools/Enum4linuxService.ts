import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import { TipoUsuario } from '@/database/functions/usuario';
import { NanoEvents } from '../../events';

interface CommandPayload {
  id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any;
  projectId: number;
  command: string;
}

interface TerminalResultPayload {
  executionId?: number;
  id?: number;
  output?: string;
  stdout?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: any;
  command?: string;
  args?: string[];
  error?: string;
}

export class Enum4linuxService extends NanoService {
  constructor() {
    super('Enum4linuxService');
  }

  initialize(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload: any) => {
      if (payload.command === 'enum4linux') {
        this.processCommand(payload as CommandPayload);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.listen(NanoEvents.ENUM4LINUX_TERMINAL_RESULT, (payload: any) => this.processResult(payload as TerminalResultPayload));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.listen(NanoEvents.ENUM4LINUX_TERMINAL_ERROR, (payload: any) => this.processError(payload as TerminalResultPayload));
  }

  private async processCommand(payload: CommandPayload) {
    const { id, args, projectId } = payload;
    const idIp = args.idIp;
    const opcoes = (args.opcoes as string) || "-U -r";

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
        const flags = opcoes.split(" ").filter((parte: string) => parte);
        const argumentos = [...flags, enderecoIp];

        this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: NanoEvents.ENUM4LINUX_TERMINAL_RESULT,
            errorTo: NanoEvents.ENUM4LINUX_TERMINAL_ERROR,
            meta: { projectId, enderecoIp, ip, idIp }
        });

    } catch (e: unknown) {
        this.bus.emit(NanoEvents.JOB_FAILED, {
            id: id,
            error: (e as Error).message || String(e)
        });
    }
  }

  private async processResult(payload: TerminalResultPayload) {
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
            id: id!,
            result: usuarios,
            rawOutput: stdout,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            executedCommand: `${command} ${(args as any).join(' ')}`
        });

      } catch (e: unknown) {
          this.bus.emit(NanoEvents.JOB_FAILED, {
              id: id!,
              error: (e as Error).message || String(e)
          });
      }
  }

  private processError(payload: TerminalResultPayload) {
      const { id, error } = payload;
      this.bus.emit(NanoEvents.JOB_FAILED, {
          id: id!,
          error: error
      });
  }
}
