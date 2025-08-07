import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';

type ResultadoExecucao = {
  caminhoArquivoSaida: string;
  erroComando?: string;
  saidaComando?: string;
  erro?: Error;
};

export const Terminal = (
  comando: string,
  argumentos: string[],
  caminhoArquivoSaida: string
): Promise<ResultadoExecucao> => {
  return new Promise((resolver, rejeitar) => {
    const processo = spawn(comando, argumentos);

    let saidaComando = "";
    let erroComando = "";


    processo.stderr.on('data', (dados: Buffer) => {
      //Exibir dado convertido para texto claro
      console.log("Data recebido", dados.buffer, dados.toString())
      saidaComando += dados.toString();
      console.error(`[Executor] Erro no comando '${comando}': ${dados.toString()}`, argumentos);
    });

    processo.stdout.on('data', (dados: Buffer) => {
      //
      console.log("Data recebido", dados.buffer, dados.toString())
      saidaComando += dados.toString();
      console.log(`[Executor] Saída do comando '${comando}': ${dados.toString()}`);
    });


    processo.on('error', (erro) => {
      console.log("Erro recebido", erro);
      erroComando += erro.toString();
      resolver({
        erro,
        erroComando,
        saidaComando,
        caminhoArquivoSaida,
      });
    });

    processo.on('close', (codigo) => {
      console.log("Close recebido:", codigo, saidaComando, erroComando)
      if (codigo === 0) {
        resolver({
          erroComando,
          saidaComando,
          caminhoArquivoSaida,
        });
      } else {
        resolver({
          erroComando,
          saidaComando,
          caminhoArquivoSaida,
          erro: new Error(`Comando '${comando}' terminou com o código de erro: ${codigo}`)
        });
      }
    });
  });
};