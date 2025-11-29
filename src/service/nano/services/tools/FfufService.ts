import { NanoService } from '../../NanoService';
import prisma from '@/database';
import fs from 'fs';
import path from 'node:path';
import os from 'node:os';
import { NanoEvents } from '../../events';
import { resolverAlvo } from './resolvedorAlvo';

export class FfufService extends NanoService {
  constructor() {
    super('FfufService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'ffuf') this.processarComando(payload);
    });
    this.listen(NanoEvents.FFUF_RESULT, (payload) => this.processarResultado(payload));
    this.listen(NanoEvents.FFUF_ERROR, (payload) => this.processarErro(payload));
  }

  private async processarComando(payload: any) {
    const { id, args, projectId } = payload;

    this.log(`Processando Ffuf para o projeto ${projectId}`);

    try {
      const { dominio, ip, alvo, caminhoBase } = await resolverAlvo(args);
      const extensoes = args.extensoes || '.php,.html,.txt,.js,.bak,.zip,.conf';
      const tipoFuzz = args.tipoFuzz === 'arquivo' ? 'arquivo' : 'diretorio';
      const alvoNormalizado = alvo.endsWith('/') ? alvo.slice(0, -1) : alvo;
      const saidaJson = path.join(os.tmpdir(), `ffuf_results_${id}_${Date.now()}.json`);
      const saidaLog = path.join(os.tmpdir(), `ffuf_log_${id}_${Date.now()}.txt`);
      const argumentosBase = ['-u', `${alvoNormalizado}/FUZZ`, '-w', '/usr/share/wordlists/dirb/common.txt', '-o', saidaJson, '-of', 'json'];
      const argumentos = tipoFuzz === 'arquivo' ? [...argumentosBase, '-e', extensoes] : argumentosBase;

      this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
        id,
        command: 'ffuf',
        args: argumentos,
        outputFile: saidaLog,
        replyTo: NanoEvents.FFUF_RESULT,
        errorTo: NanoEvents.FFUF_ERROR,
        meta: { projectId, dominio, ip, caminhoBase, alvo: alvoNormalizado, tipoFuzz, saidaJson, saidaLog }
      });
    } catch (e: any) {
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: e.message });
    }
  }

  private async processarResultado(payload: any) {
    const { id, stdout, meta, command, args } = payload;
    const { dominio, ip, caminhoBase, saidaJson, saidaLog, tipoFuzz } = meta;

    this.log(`Processando resultado ${id}`);

    try {
      if (!saidaJson || !fs.existsSync(saidaJson)) throw new Error('Saída não encontrada');

      const conteudo = fs.readFileSync(saidaJson, 'utf8');
      const dados = JSON.parse(conteudo);
      const resultados = Array.isArray(dados.results) ? dados.results : [];
      const caminhos = this.normalizarResultados(resultados, caminhoBase || '');

      for (const resultado of caminhos) {
        await prisma.diretorio.create({
          data: {
            caminho: resultado.caminho,
            status: resultado.status,
            tamanho: resultado.tamanho,
            dominioId: dominio ? dominio.id : null,
            ipId: ip ? ip.id : null,
            tipo: tipoFuzz === 'arquivo' ? 'arquivo' : 'diretorio'
          }
        });
      }

      this.removerArquivos(saidaJson, saidaLog);

      this.bus.emit(NanoEvents.JOB_COMPLETED, {
        id,
        result: caminhos,
        rawOutput: stdout,
        executedCommand: `${command} ${args.join(' ')}`
      });
    } catch (e: any) {
      this.removerArquivos(saidaJson, saidaLog);

      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: e.message });
    }
  }

  private processarErro(payload: any) {
    const { id, error, meta } = payload;
    const { saidaJson, saidaLog } = meta || {};

    this.removerArquivos(saidaJson, saidaLog);

    this.bus.emit(NanoEvents.JOB_FAILED, { id, error });
  }

  private normalizarResultados(resultados: any[], prefixo: string) {
    if (!resultados.length) return [] as any[];

    const estatisticas = new Map<string, number>();
    resultados.forEach((res: any) => {
      const chave = `${res.status}-${res.length}`;
      estatisticas.set(chave, (estatisticas.get(chave) || 0) + 1);
    });

    let chaveDominante = '';
    let maior = -1;
    estatisticas.forEach((quantidade, chave) => {
      if (quantidade > maior) {
        maior = quantidade;
        chaveDominante = chave;
      }
    });

    const filtrados = maior > 1 ? resultados.filter((res: any) => `${res.status}-${res.length}` !== chaveDominante) : resultados;

    return filtrados.map((resultado: any) => ({
      caminho: this.normalizarCaminho(prefixo, resultado.input?.FUZZ ?? ''),
      status: resultado.status,
      tamanho: resultado.length
    }));
  }

  private normalizarCaminho(base: string, parte: string) {
    const prefixo = base || '';
    const caminhoBase = prefixo ? (prefixo.startsWith('/') ? prefixo : `/${prefixo}`) : '';
    const complemento = parte.startsWith('/') ? parte : `/${parte}`;
    const combinado = `${caminhoBase}${complemento}`.replace(/\/+/g, '/');
    return combinado === '' ? '/' : combinado;
  }

  private removerArquivos(...arquivos: (string | null | undefined)[]) {
    arquivos.forEach((arquivo) => {
      if (arquivo && fs.existsSync(arquivo)) fs.unlinkSync(arquivo);
    });
  }
}
