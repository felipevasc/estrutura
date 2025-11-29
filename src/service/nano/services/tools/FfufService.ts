import { NanoService } from '../../NanoService';
import prisma from '@/database';
import fs from 'fs';
import path from 'node:path';
import os from 'node:os';
import { NanoEvents } from '../../events';

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

  private async obterAlvo(args: any) {
    let dominio = null;
    let ip = null;
    let diretorio = null;

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

    this.log(`Processando Ffuf para o projeto ${projectId}`);

    try {
      const { dominio, ip, alvo, caminhoBase } = await this.obterAlvo(args);
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
    const { dominio, ip, caminhoBase, saidaJson, saidaLog } = meta;

    this.log(`Processando resultado ${id}`);

    try {
      if (!saidaJson || !fs.existsSync(saidaJson)) throw new Error('Saída não encontrada');

      const conteudo = fs.readFileSync(saidaJson, 'utf8');
      const dados = JSON.parse(conteudo);
      const resultados = Array.isArray(dados.results) ? dados.results : [];
      const prefixo = caminhoBase || '';

      if (resultados.length) {
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

        for (const resultado of filtrados) {
          const parte = resultado.input?.FUZZ ?? '';
          const caminho = this.normalizarCaminho(prefixo, parte);
          const status = resultado.status;
          const tamanho = resultado.length;

          await prisma.diretorio.create({
            data: {
              caminho,
              status,
              tamanho,
              dominioId: dominio ? dominio.id : null,
              ipId: ip ? ip.id : null
            }
          });
        }
      }

      if (saidaJson && fs.existsSync(saidaJson)) fs.unlinkSync(saidaJson);
      if (saidaLog && fs.existsSync(saidaLog)) fs.unlinkSync(saidaLog);

      this.bus.emit(NanoEvents.JOB_COMPLETED, {
        id,
        result: resultados,
        rawOutput: stdout,
        executedCommand: `${command} ${args.join(' ')}`
      });
    } catch (e: any) {
      if (saidaLog && fs.existsSync(saidaLog)) fs.unlinkSync(saidaLog);
      if (saidaJson && fs.existsSync(saidaJson)) fs.unlinkSync(saidaJson);

      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: e.message });
    }
  }

  private processarErro(payload: any) {
    const { id, error, meta } = payload;
    const { saidaJson, saidaLog } = meta || {};

    if (saidaJson && fs.existsSync(saidaJson)) fs.unlinkSync(saidaJson);
    if (saidaLog && fs.existsSync(saidaLog)) fs.unlinkSync(saidaLog);

    this.bus.emit(NanoEvents.JOB_FAILED, { id, error });
  }

  private normalizarCaminho(base: string, parte: string) {
    const prefixo = base || '';
    const caminhoBase = prefixo ? (prefixo.startsWith('/') ? prefixo : `/${prefixo}`) : '';
    const complemento = parte.startsWith('/') ? parte : `/${parte}`;
    const combinado = `${caminhoBase}${complemento}`.replace(/\/+/g, '/');
    return combinado === '' ? '/' : combinado;
  }
}
