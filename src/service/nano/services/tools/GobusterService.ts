import { NanoService } from '../../NanoService';
import prisma from '@/database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { NanoEvents } from '../../events';
import { extrairResultadosGobuster } from './parserGobuster';
import { resolverAlvo } from './resolvedorAlvo';

export class GobusterService extends NanoService {
  constructor() {
    super('GobusterService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'gobuster') this.processarComando(payload);
    });

    this.listen(NanoEvents.GOBUSTER_RESULT, (payload) => this.processarResultado(payload));
    this.listen(NanoEvents.GOBUSTER_ERROR, (payload) => this.processarErro(payload));
  }

  private async processarComando(payload: any) {
    const { id, args, projectId } = payload;

    this.log(`Iniciando Gobuster para projeto ${projectId}`);

    try {
      const { dominio, ip, alvo, caminhoBase } = await resolverAlvo(args);
      const tipoFuzz = args.tipoFuzz === 'arquivo' ? 'arquivo' : 'diretorio';
      const extensoes = args.extensoes || '.php,.html,.txt,.js,.bak,.zip,.conf';
      const alvoNormalizado = alvo.endsWith('/') ? alvo.slice(0, -1) : alvo;
      const arquivoResultado = path.join(os.tmpdir(), `gobuster_${projectId}_${id}_${Date.now()}.txt`);
      const arquivoLog = path.join(os.tmpdir(), `gobuster_${projectId}_${id}_${Date.now()}_log.txt`);
      const argumentosBase = ['dir', '-u', alvoNormalizado, '-w', '/usr/share/wordlists/dirb/common.txt', '-o', arquivoResultado, '-q', '-k'];
      const argumentos = tipoFuzz === 'arquivo' ? [...argumentosBase, '-x', extensoes] : argumentosBase;

      this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
        id,
        command: 'gobuster',
        args: argumentos,
        outputFile: arquivoLog,
        replyTo: NanoEvents.GOBUSTER_RESULT,
        errorTo: NanoEvents.GOBUSTER_ERROR,
        meta: { projectId, dominio, ip, arquivoResultado, arquivoLog, alvo: alvoNormalizado, caminhoBase, tipoFuzz }
      });
    } catch (e: any) {
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: e.message });
    }
  }

  private async processarResultado(payload: any) {
    const { id, meta, command, args } = payload;
    const { dominio, ip, arquivoResultado, arquivoLog, alvo, caminhoBase, tipoFuzz } = meta;

    try {
      if (!arquivoResultado || !fs.existsSync(arquivoResultado)) throw new Error('Saída não encontrada');

      const conteudo = fs.readFileSync(arquivoResultado, 'utf-8');
      const brutos = extrairResultadosGobuster(conteudo, alvo);
      const prefixo = caminhoBase || '';

      const resultados = brutos.map((resultado) => ({
        ...resultado,
        caminho: this.normalizarCaminho(prefixo, resultado.caminho)
      }));

      for (const resultado of resultados) {
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

      this.removerArquivos(arquivoResultado, arquivoLog);

      this.bus.emit(NanoEvents.JOB_COMPLETED, {
        id,
        result: resultados,
        rawOutput: conteudo,
        executedCommand: `${command} ${args.join(' ')}`
      });
    } catch (e: any) {
      this.removerArquivos(arquivoResultado, arquivoLog);

      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: e.message });
    }
  }

  private processarErro(payload: any) {
    const { id, error, meta } = payload;
    const { arquivoResultado, arquivoLog } = meta || {};

    this.removerArquivos(arquivoResultado, arquivoLog);

    this.bus.emit(NanoEvents.JOB_FAILED, { id, error });
  }

  private normalizarCaminho(base: string, caminho: string) {
    const prefixo = base || '';
    const caminhoBase = prefixo ? (prefixo.startsWith('/') ? prefixo : `/${prefixo}`) : '';
    const alvo = caminho.startsWith('/') ? caminho : `/${caminho}`;
    const combinado = `${caminhoBase}${alvo}`.replace(/\/+/g, '/');
    return combinado === '' ? '/' : combinado;
  }

  private removerArquivos(...arquivos: (string | null | undefined)[]) {
    arquivos.forEach((arquivo) => {
      if (arquivo && fs.existsSync(arquivo)) fs.unlinkSync(arquivo);
    });
  }
}
