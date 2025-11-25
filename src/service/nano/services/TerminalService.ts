import { NanoService } from '../NanoService';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { NanoEvents } from '../events';

export class TerminalService extends NanoService {
  constructor() {
    super('TerminalService');
  }

  initialize(): void {
    this.bus.on(NanoEvents.EXECUTE_TERMINAL, (payload) => this.execute(payload));
  }

  private execute(payload: any) {
    const { id, command, args, outputFile, replyTo, errorTo, meta } = payload;
    const executionId = id ?? payload.executionId;
    this.log(`Executing: ${command} ${args.join(' ')}`);

    const processo = spawn(command, args);
    let stdoutOutput = "";
    let stderrOutput = "";
    let combinedOutput = "";
    let processError = "";

    // Only write to file if outputFile is provided
    let streamArquivo: any = null;
    if (outputFile) {
        streamArquivo = createWriteStream(outputFile, { flags: 'a' });
    }

    processo.stderr.on('data', (dados: Buffer) => {
      const texto = dados.toString();
      stderrOutput += texto;
      combinedOutput += texto;
      if (streamArquivo) streamArquivo.write(texto);
    });

    processo.stdout.on('data', (dados: Buffer) => {
      const texto = dados.toString();
      stdoutOutput += texto;
      combinedOutput += texto;
      if (streamArquivo) streamArquivo.write(texto);
    });

    processo.on('error', (erro) => {
      this.error("Erro recebido", erro);
      processError += erro.toString();
      if (streamArquivo) streamArquivo.close();

      const errorEvent = errorTo || NanoEvents.TERMINAL_ERROR;
      this.bus.emit(errorEvent, {
          id: executionId, // Standardized on id
          executionId,     // Kept for backward compatibility
          error: processError || erro.message,
          output: combinedOutput, // Backward compatibility
          stdout: stdoutOutput,
          stderr: stderrOutput,
          meta,
          command,
          args
      });
    });

    processo.on('close', (codigo) => {
      if (streamArquivo) streamArquivo.close();

      if (codigo === 0) {
        const successEvent = replyTo || NanoEvents.TERMINAL_RESULT;
        this.bus.emit(successEvent, {
            id: executionId,
            executionId,
            output: combinedOutput,
            stdout: stdoutOutput,
            stderr: stderrOutput,
            error: processError,
            meta,
            command,
            args
        });
      } else {
        const errorEvent = errorTo || NanoEvents.TERMINAL_ERROR;
        this.bus.emit(errorEvent, {
            id: executionId,
            executionId,
            error: processError || `Comando '${command}' terminou com o código de erro: ${codigo}`,
            output: combinedOutput,
            stdout: stdoutOutput,
            stderr: stderrOutput,
            meta,
            command,
            args
        });
      }
    });
  }
}
