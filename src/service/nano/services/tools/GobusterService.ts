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
    let dominio = null;
    let ip = null;

    if (args.idDominio) dominio = await prisma.dominio.findUnique({ where: { id: parseInt(args.idDominio) } });
    if (!dominio && args.idIp) ip = await prisma.ip.findUnique({ where: { id: parseInt(args.idIp) } });

    if (!dominio && !ip) throw new Error('Alvo não encontrado');

    const enderecoBase = dominio ? dominio.endereco : ip?.endereco ?? '';
    if (!enderecoBase) throw new Error('Alvo inválido');

    let alvo = enderecoBase;
    if (!alvo.startsWith('http')) alvo = `http://${alvo}`;

    return { dominio, ip, alvo };
  }

  private async processarComando(payload: any) {
    const { id, args, projectId } = payload;

    this.log(`Iniciando Gobuster para projeto ${projectId}`);

    try {
      const { dominio, ip, alvo } = await this.obterAlvo(args);
      const arquivoResultado = path.join(os.tmpdir(), `gobuster_${projectId}_${id}_${Date.now()}.txt`);
      const arquivoLog = path.join(os.tmpdir(), `gobuster_${projectId}_${id}_${Date.now()}_log.txt`);
      const argumentos = ['dir', '-u', alvo, '-w', '/usr/share/wordlists/dirb/common.txt', '-o', arquivoResultado, '-q', '-k'];

      this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
        id,
        command: 'gobuster',
        args: argumentos,
        outputFile: arquivoLog,
        replyTo: NanoEvents.GOBUSTER_RESULT,
        errorTo: NanoEvents.GOBUSTER_ERROR,
        meta: { projectId, dominio, ip, arquivoResultado, arquivoLog, alvo }
      });
    } catch (e: any) {
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: e.message });
    }
  }

  private async processarResultado(payload: any) {
    const { id, meta, command, args } = payload;
    const { dominio, ip, arquivoResultado, arquivoLog, alvo } = meta;

    try {
      if (!arquivoResultado || !fs.existsSync(arquivoResultado)) throw new Error('Saída não encontrada');

      const conteudo = fs.readFileSync(arquivoResultado, 'utf-8');
      const resultados = extrairResultadosGobuster(conteudo, alvo);

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
}
