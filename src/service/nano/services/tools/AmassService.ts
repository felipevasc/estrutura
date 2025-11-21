import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import { TipoIp } from '@/database/functions/ip';

export class AmassService extends NanoService {
  initialize(): void {
    this.listen('COMMAND_RECEIVED', (payload) => {
      if (payload.command === 'amass') {
        this.processCommand(payload);
      }
    });

    this.listen('AMASS_TERMINAL_RESULT', (payload) => this.processResult(payload));
    this.listen('AMASS_TERMINAL_ERROR', (payload) => this.processError(payload));
  }

  private async processCommand(payload: any) {
    const { id, args, projectId } = payload;
    const idDominio = args.idDominio;

    this.log(`Processing Amass for domain ID: ${idDominio}`);

    try {
        const op = await prisma.dominio.findFirst({
            where: { id: Number(idDominio) }
        });
        const dominio = op?.endereco ?? "";

        if (!op?.endereco || !this.validarDominio(dominio)) {
            throw new Error('Domínio inválido ou inseguro fornecido.');
        }

        const nomeArquivoSaida = `amass_resultado_${op?.projetoId}_${op?.id}_${dominio}_${Date.now()}.txt`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);
        const comando = 'amass';
        // Removed "2>&1" because spawn does not support shell redirection in args
        const argumentos = ['enum', '-d', dominio, '-timeout', "2"];

        this.bus.emit('EXECUTE_TERMINAL', {
            id: id,
            command: comando,
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: 'AMASS_TERMINAL_RESULT',
            errorTo: 'AMASS_TERMINAL_ERROR',
            meta: { projectId, dominio, op }
        });

    } catch (e: any) {
        this.bus.emit('JOB_FAILED', {
            id: id,
            error: e.message
        });
    }
  }

  private async processResult(payload: any) {
      const { executionId, id, output, meta, command, args } = payload;
      const jobId = id ?? executionId;
      const { op } = meta;
      const { dominio } = meta;

      this.log(`Processing result for ${jobId}`);

      try {
        const subdominios: string[] = [];
        const redes: string[] = [];
        const ips: TipoIp[] = [];

        const addElemento = (elemento: string, tipo: string, elementoAssociado: string, tipoAssociado: string) => {
            if (tipo === "FQDN") {
            subdominios.push(elemento);
            } else if (tipo === "IPAddress") {
            if (tipoAssociado === "FQDN") {
                ips.push({
                endereco: elemento,
                dominio: elementoAssociado,
                });
            }
            } else if (tipo === "Netblock") {
            redes.push(elemento);
            }
        }

        // Use combined output (stdout + stderr) as amass might print important info to stderr?
        // Actually, amass prints results to stdout.
        // But since we kept 'output' as combined in TerminalService, we are good.
        output?.split("\n").forEach((linha: string) => {
            const colunas = linha.split(" --> ");
            if (colunas.length === 3) {
            const tmp0 = colunas[0]?.trim()?.replaceAll(")", "").split("(");
            const ativoOrigem = tmp0[0].trim();
            const tipoAtivoOrigem = tmp0[1];

            const tmp1 = colunas[2].trim().replaceAll(")", "").split("(");
            // console.warn(tmp0, tmp1)
            const ativoDestino = tmp1[0].trim();
            const tipoAtivoDestino = tmp1[1].trim();

            // const relacao = colunas[1].trim();

            if (ativoOrigem.indexOf(dominio) > -1 || ativoDestino.indexOf(dominio) > -1) {
                addElemento(ativoOrigem, tipoAtivoOrigem, ativoDestino, tipoAtivoDestino);
                addElemento(ativoDestino, tipoAtivoDestino, ativoOrigem, tipoAtivoOrigem);
            }
            }
        });

        const tmp = {
            subdominios: subdominios.filter((i, idx) => idx === subdominios.findIndex((item) => item === i)).sort((a, b) => a.split(".").reverse().join(".") > b.split(".").reverse().join(".") ? 1 : -1),
            ips: ips.filter((i, idx) => idx === ips.findIndex((item) => item === i)).sort(),
            redes: redes.filter((i, idx) => idx === redes.findIndex((item) => item === i)).sort(),
        }

        await Database.adicionarSubdominio(tmp.subdominios, op?.projetoId ?? 0);
        await Database.adicionarIp(tmp.ips, op?.projetoId ?? 0);

        this.bus.emit('JOB_COMPLETED', {
            id: jobId,
            result: tmp,
            rawOutput: output,
            executedCommand: `${command} ${args.join(' ')}`
        });

      } catch (e: any) {
          this.bus.emit('JOB_FAILED', {
              id: jobId,
              error: e.message
          });
      }
  }

  private processError(payload: any) {
      const { executionId, id, error } = payload;
      this.bus.emit('JOB_FAILED', {
          id: id ?? executionId,
          error: error
      });
  }

  private validarDominio(dominio: string): boolean {
    const regexDominio = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
    return regexDominio.test(dominio);
  }
}
