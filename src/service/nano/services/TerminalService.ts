import { NanoService } from '../NanoService';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { NanoEvents } from '../events';
import { obterCaminhoLogExecucao, registrarComandoFerramenta } from './tools/armazenamentoExecucao';

interface TerminalPayload {
  id: number;
  command: string;
  args: string[];
  replyTo?: string;
  errorTo?: string;
  meta?: Record<string, unknown>;
  outputFile?: string;
  executionId?: number;
}

export class TerminalService extends NanoService {
  constructor() {
    super('TerminalService');
  }

  initialize(): void {
    this.listen(NanoEvents.EXECUTE_TERMINAL, (payload) => this.execute(payload as TerminalPayload));
  }

  private execute(payload: TerminalPayload) {
    const { id, command, args, replyTo, errorTo, meta, outputFile } = payload;
    const executionId = id ?? (payload as any).executionId;
    const caminhoSaida = obterCaminhoLogExecucao(executionId);
    const linhaComando = registrarComandoFerramenta(command, executionId, command, args);
    const caminhosSaida = [caminhoSaida, outputFile].filter(Boolean) as string[];
    const arquivoDestino = outputFile ?? caminhoSaida;
    this.log(`Executing: ${command} ${args.join(' ')}`);

    const processo = spawn(command, args);
    let stdoutOutput = "";
    let stderrOutput = "";
    let combinedOutput = "";
    let processError = "";

    const fluxos = caminhosSaida.map((caminho) => createWriteStream(caminho, { flags: 'a' }));

    processo.stderr.on('data', (dados: Buffer) => {
      const texto = dados.toString();
      stderrOutput += texto;
      combinedOutput += texto;
      fluxos.forEach((fluxo) => fluxo.write(texto));
    });

    processo.stdout.on('data', (dados: Buffer) => {
      const texto = dados.toString();
      stdoutOutput += texto;
      combinedOutput += texto;
      fluxos.forEach((fluxo) => fluxo.write(texto));
    });

    processo.on('error', (erro) => {
      this.error("Erro recebido", erro);
      processError += erro.toString();
      fluxos.forEach((fluxo) => fluxo.close());

      const errorEvent = errorTo || NanoEvents.TERMINAL_ERROR;
      this.bus.emit(errorEvent, {
        id: executionId,
        executionId,
        error: processError || erro.message,
        output: combinedOutput,
        stdout: stdoutOutput,
        stderr: stderrOutput,
        outputFile: arquivoDestino,
        meta: { ...meta, linhaComando, caminhoLog: caminhoSaida },
        command,
        args
      });
    });

    processo.on('close', (codigo) => {
      fluxos.forEach((fluxo) => fluxo.close());

      if (codigo === 0) {
        const successEvent = replyTo || NanoEvents.TERMINAL_RESULT;
        this.bus.emit(successEvent, {
          id: executionId,
          executionId,
          output: combinedOutput,
          stdout: stdoutOutput,
          stderr: stderrOutput,
          error: processError,
          outputFile: arquivoDestino,
          meta: { ...meta, linhaComando, caminhoLog: caminhoSaida },
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
          outputFile: arquivoDestino,
          meta: { ...meta, linhaComando, caminhoLog: caminhoSaida },
          command,
          args
        });
      }
    });
  }
}
