import { NanoService } from '../../NanoService';
import prisma from '@/database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { NanoEvents } from '../../events';
import { extrairResultadosGobuster } from './parserGobuster';

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

  private async obterAlvo(args: any) {
    let diretorio = null;
    let dominio = null;
    let ip = null;

    if (args.idDiretorio) {
      diretorio = await prisma.diretorio.findUnique({
        where: { id: parseInt(args.idDiretorio) },
        include: { dominio: true, ip: true }
      });
    }

    if (args.idDominio && !diretorio?.dominio) dominio = await prisma.dominio.findUnique({ where: { id: parseInt(args.idDominio) } });
    if (args.idIp && !diretorio?.ip) ip = await prisma.ip.findUnique({ where: { id: parseInt(args.idIp) } });

    const alvoDominio = diretorio?.dominio ?? dominio;
    const alvoIp = diretorio?.ip ?? ip;

    if (!alvoDominio && !alvoIp) throw new Error('Alvo não encontrado');

    const base = alvoDominio ? alvoDominio.endereco : alvoIp?.endereco ?? '';
    if (!base) throw new Error('Alvo inválido');

    const caminhoBase = diretorio?.caminho ?? args.caminhoBase ?? '';
    const caminhoNormalizado = caminhoBase ? (caminhoBase.startsWith('/') ? caminhoBase : `/${caminhoBase}`) : '';
    const endereco = base.startsWith('http') ? base : `http://${base}`;
    const alvo = caminhoNormalizado ? `${endereco}${caminhoNormalizado}` : endereco;

    return { dominio: alvoDominio, ip: alvoIp, alvo, caminhoBase: caminhoNormalizado };
  }

  private async processarComando(payload: any) {
    const { id, args, projectId } = payload;

    this.log(`Iniciando Gobuster para projeto ${projectId}`);

    try {
      const { dominio, ip, alvo, caminhoBase } = await this.obterAlvo(args);
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
    const { dominio, ip, arquivoResultado, arquivoLog, alvo, caminhoBase } = meta;

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
            ipId: ip ? ip.id : null
          }
        });
      }

      fs.unlinkSync(arquivoResultado);
      if (arquivoLog && fs.existsSync(arquivoLog)) fs.unlinkSync(arquivoLog);

      this.bus.emit(NanoEvents.JOB_COMPLETED, {
        id,
        result: resultados,
        rawOutput: conteudo,
        executedCommand: `${command} ${args.join(' ')}`
      });
    } catch (e: any) {
      if (arquivoResultado && fs.existsSync(arquivoResultado)) fs.unlinkSync(arquivoResultado);
      if (arquivoLog && fs.existsSync(arquivoLog)) fs.unlinkSync(arquivoLog);

      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: e.message });
    }
  }

  private processarErro(payload: any) {
    const { id, error, meta } = payload;
    const { arquivoResultado, arquivoLog } = meta || {};

    if (arquivoResultado && fs.existsSync(arquivoResultado)) fs.unlinkSync(arquivoResultado);
    if (arquivoLog && fs.existsSync(arquivoLog)) fs.unlinkSync(arquivoLog);

    this.bus.emit(NanoEvents.JOB_FAILED, { id, error });
  }

  private normalizarCaminho(base: string, caminho: string) {
    const prefixo = base || '';
    const caminhoBase = prefixo ? (prefixo.startsWith('/') ? prefixo : `/${prefixo}`) : '';
    const alvo = caminho.startsWith('/') ? caminho : `/${caminho}`;
    const combinado = `${caminhoBase}${alvo}`.replace(/\/+/g, '/');
    return combinado === '' ? '/' : combinado;
  }
}
