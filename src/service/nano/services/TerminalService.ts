import { NanoService } from '../NanoService';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';

export class TerminalService extends NanoService {
  initialize(): void {
    this.bus.on('EXECUTE_TERMINAL', (payload) => this.execute(payload));
  }

  private execute(payload: any) {
    const { executionId, command, args, outputFile, replyTo, errorTo, meta } = payload;
    this.log(`Executing: ${command} ${args.join(' ')}`);

    const processo = spawn(command, args);
    let saidaComando = "";
    let erroComando = "";

    // Only write to file if outputFile is provided
    let streamArquivo: any = null;
    if (outputFile) {
        streamArquivo = createWriteStream(outputFile, { flags: 'a' });
    }

    processo.stderr.on('data', (dados: Buffer) => {
      const texto = dados.toString();
      saidaComando += texto;
    });

    processo.stdout.on('data', (dados: Buffer) => {
      const texto = dados.toString();
      saidaComando += texto;
    });

    processo.on('error', (erro) => {
      this.error("Erro recebido", erro);
      erroComando += erro.toString();
      if (streamArquivo) streamArquivo.close();

      const errorEvent = errorTo || 'TERMINAL_ERROR';
      this.bus.emit(errorEvent, {
          executionId,
          error: erroComando || erro.message,
          output: saidaComando,
          meta,
          command,
          args
      });
    });

    processo.on('close', (codigo) => {
      if (streamArquivo) streamArquivo.close();

      if (codigo === 0) {
        const successEvent = replyTo || 'TERMINAL_RESULT';
        this.bus.emit(successEvent, {
            executionId,
            output: saidaComando,
            error: erroComando,
            meta,
            command,
            args
        });
      } else {
        const errorEvent = errorTo || 'TERMINAL_ERROR';
        this.bus.emit(errorEvent, {
            executionId,
            error: erroComando || `Comando '${command}' terminou com o código de erro: ${codigo}`,
            output: saidaComando,
            meta,
            command,
            args
        });
      }
    });
  }
}
