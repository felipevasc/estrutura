import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { TipoIp } from '@/database/functions/ip';
import { TipoDominio } from '@prisma/client';
import { NanoEvents } from '../../events';
import { lerLogExecucao, obterCaminhoLogExecucao, obterComandoRegistrado, registrarComandoFerramenta } from './armazenamentoExecucao';
import { RegistroInformacaoDominio } from '@/database/functions/informacaoDominio';

interface CommandPayload {
  id: number;
  args: any;
  projectId: number;
  command: string;
}

interface TerminalResultPayload {
  executionId?: number;
  id?: number;
  output?: string;
  meta: any;
  command?: string;
  args?: string[];
  error?: string;
}

export class AmassService extends NanoService {
  constructor() {
    super('AmassService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload: any) => {
      if (payload.command === 'amass') {
        this.processarComando(payload);
      }
    });

    this.listen(NanoEvents.AMASS_TERMINAL_RESULT, (payload: any) => this.processarResultado(payload));
    this.listen(NanoEvents.AMASS_TERMINAL_ERROR, (payload: any) => this.processarErro(payload));
  }

  private async processarComando(payload: CommandPayload) {
    const { id, args, projectId } = payload;

    try {
      const dados = typeof args === 'string' ? JSON.parse(args) : args ?? {};
      const idDominio = Number(dados.idDominio);
      const timeout = this.normalizarTimeout(dados.timeoutMinutos);

      this.log(`Processando Amass para o domínio ${idDominio}`);

      if (!Number.isInteger(idDominio) || idDominio <= 0) {
        throw new Error('Domínio não informado ou inválido.');
      }

      const op = await prisma.dominio.findFirst({
        where: { id: Number(idDominio) }
      });

      const dominio = op?.endereco ?? '';

      if (!op?.endereco || !this.validarDominio(dominio)) {
        throw new Error('Domínio inválido ou inseguro fornecido.');
      }

      const arquivoJson = path.join(os.tmpdir(), `amass_${op?.projetoId}_${id}_${Date.now()}.json`);

      const argumentos = ['enum', '-d', dominio, '-timeout', String(timeout), '-json', arquivoJson];
      const linhaComando = registrarComandoFerramenta('amass', id, 'amass', argumentos);
      const caminhoLog = obterCaminhoLogExecucao(id);

      this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
        id,
        command: 'amass',
        args: argumentos,
        outputFile: caminhoLog,
        replyTo: NanoEvents.AMASS_TERMINAL_RESULT,
        errorTo: NanoEvents.AMASS_TERMINAL_ERROR,
        meta: { projectId, dominio, op, jsonOutputFile: arquivoJson, linhaComando }
      });
    } catch (e: unknown) {
      this.bus.emit(NanoEvents.JOB_FAILED, {
        id,
        error: (e as Error).message || String(e)
      });
    }
  }

  private async processarResultado(payload: TerminalResultPayload) {
    const { executionId, id, output, meta, command, args } = payload;
    const jobId = (id ?? executionId) as number;
    const { op, jsonOutputFile, linhaComando } = meta;

    this.log(`Processando resultado ${jobId}`);

    try {
      const subdominios = new Set<string>();
      const ips: TipoIp[] = [];
      const registrosDns = new Map<string, Set<string>>();
      const emails = new Set<string>();
      const aliases: { origem: string; destino: string }[] = [];
      const dominioRaiz = op?.endereco ?? '';

      if (fs.existsSync(jsonOutputFile)) {
        const conteudo = fs.readFileSync(jsonOutputFile, 'utf-8');
        const linhas = conteudo.split('\n').filter((linha) => linha.trim());

        for (const linha of linhas) {
          try {
            const item = JSON.parse(linha);

            const nomeRegistro = typeof item.name === 'string' ? item.name.trim() : '';
            const dominioItem = typeof item.domain === 'string' ? item.domain.trim() : '';
            if (this.eSubdominio(nomeRegistro, dominioRaiz)) subdominios.add(nomeRegistro);
            const dominioRelacionado = this.obterDominioRelacionado(nomeRegistro, dominioItem, dominioRaiz);
            if (Array.isArray(item.addresses)) {
              for (const endereco of item.addresses) {
                if (endereco.ip && dominioRelacionado) {
                  ips.push({
                    endereco: endereco.ip,
                    dominio: dominioRelacionado
                  });
                }
              }
            }
            this.extrairRegistros(item).forEach((registro) => {
              const nome = registro.nome || dominioRelacionado;
              if (!nome || (!this.eSubdominio(nome, dominioRaiz) && nome !== dominioRaiz)) return;
              const tipo = registro.tipo.toUpperCase();
              const valor = registro.valor;
              if (!tipo || !valor) return;
              this.agruparRegistroDns(registrosDns, tipo, `${nome} -> ${valor}`);
              if (tipo === 'MX') emails.add(valor);
              if (tipo === 'CNAME') aliases.push({ origem: nome, destino: valor });
            });
            if (Array.isArray(item.emails)) {
              item.emails.forEach((email: any) => {
                const texto = typeof email === 'string' ? email.trim() : '';
                if (texto) emails.add(texto);
              });
            }
          } catch {}
        }

        fs.unlinkSync(jsonOutputFile);
      }

      const subdominiosUnicos = [...subdominios];
      const ipsUnicos = ips.filter((valor, indice, array) => array.findIndex((item) => item.endereco === valor.endereco && item.dominio === valor.dominio) === indice);

      if (subdominiosUnicos.length > 0) {
        await Database.adicionarSubdominio(subdominiosUnicos, op?.projetoId ?? 0, TipoDominio.dns);
      }

      if (aliases.length > 0) {
        await this.salvarAliases(aliases, op?.projetoId ?? 0, dominioRaiz);
      }

      if (ipsUnicos.length > 0) {
        await Database.adicionarIp(ipsUnicos, op?.projetoId ?? 0);
      }

      if ((op?.id ?? 0) > 0) {
        const registros = this.converterInformacoesDns(registrosDns, emails, op?.id ?? 0);
        if (registros.length > 0) await Database.salvarInformacoesDominio(registros);
      }

      this.bus.emit(NanoEvents.JOB_COMPLETED, {
        id: jobId,
        result: { subdominios: subdominiosUnicos, ips: ipsUnicos },
        rawOutput: lerLogExecucao(jobId) || output,
        executedCommand: linhaComando || obterComandoRegistrado('amass', jobId as number) || `${command} ${(args as any).join(' ')}`
      });
    } catch (e: unknown) {
      if (jsonOutputFile && fs.existsSync(jsonOutputFile)) fs.unlinkSync(jsonOutputFile);

      this.bus.emit(NanoEvents.JOB_FAILED, {
        id: jobId,
        error: (e as Error).message || String(e)
      });
    }
  }

  private processarErro(payload: TerminalResultPayload) {
    const { executionId, id, error, meta } = payload;
    const { jsonOutputFile } = meta || {};

    if (jsonOutputFile && fs.existsSync(jsonOutputFile)) fs.unlinkSync(jsonOutputFile);

    this.bus.emit(NanoEvents.JOB_FAILED, {
      id: id ?? executionId,
      error: error
    });
  }

  private validarDominio(dominio: string): boolean {
    const regexDominio = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
    return regexDominio.test(dominio);
  }

  private normalizarTimeout(valor: unknown) {
    const texto = typeof valor === 'string' ? valor : String(valor ?? '');
    const numero = Number.parseFloat(texto.replace(/[^0-9.,-]/g, '').replace(',', '.'));
    const minutos = Number.isFinite(numero) && numero > 0 ? Math.ceil(numero) : 5;
    return minutos;
  }

  private eSubdominio(valor: string, dominioRaiz: string) {
    if (!valor || !dominioRaiz) return false;
    if (valor === dominioRaiz) return false;
    return valor.endsWith(`.${dominioRaiz}`);
  }

  private obterDominioRelacionado(nome: string, dominioItem: string, dominioRaiz: string) {
    if (this.eSubdominio(nome, dominioRaiz)) return nome;
    if (this.eSubdominio(dominioItem, dominioRaiz)) return dominioItem;
    if (nome === dominioRaiz || dominioItem === dominioRaiz) return dominioRaiz;
    return '';
  }

  private extrairRegistros(item: any) {
    const lista = Array.isArray(item?.records) ? item.records : Array.isArray(item?.dns_records) ? item.dns_records : [];
    return lista
      .map((registro: any) => {
        const nome = typeof registro.name === 'string' ? registro.name : typeof registro.rrname === 'string' ? registro.rrname : '';
        const tipo = typeof registro.type === 'string' ? registro.type : typeof registro.rrtype === 'string' ? registro.rrtype : '';
        const valor = typeof registro.value === 'string' ? registro.value : typeof registro.rrdata === 'string' ? registro.rrdata : '';
        return { nome: nome.trim(), tipo: tipo.trim(), valor: valor.trim() };
      })
      .filter((registro: any) => registro.tipo && registro.valor);
  }

  private agruparRegistroDns(mapa: Map<string, Set<string>>, tipo: string, valor: string) {
    const chave = tipo.toLowerCase();
    if (!mapa.has(chave)) mapa.set(chave, new Set());
    mapa.get(chave)?.add(valor);
  }

  private async salvarAliases(aliases: { origem: string; destino: string }[], projetoId: number, dominioRaiz: string) {
    if (!projetoId) return;
    const existentes = await prisma.dominio.findMany({ where: { projetoId } });
    const mapa = new Map(existentes.map((d) => [d.endereco, d]));
    const novos = aliases.filter((alias) => this.eSubdominio(alias.origem, dominioRaiz));
    for (const alias of novos) {
      const pai = mapa.get(alias.destino) ?? (this.eSubdominio(alias.destino, dominioRaiz) ? mapa.get(alias.destino) : undefined);
      const atual = mapa.get(alias.origem);
      if (atual) {
        const precisaAtualizar = atual.alias !== alias.destino || (pai?.id && atual.paiId !== pai.id);
        if (precisaAtualizar) {
          const atualizado = await prisma.dominio.update({ where: { id: atual.id }, data: { alias: alias.destino, paiId: pai?.id ?? atual.paiId ?? null } });
          mapa.set(atualizado.endereco, atualizado);
        }
        continue;
      }
      const criado = await prisma.dominio.create({ data: { endereco: alias.origem, alias: alias.destino, projetoId, paiId: pai?.id ?? null, tipo: TipoDominio.dns } });
      mapa.set(criado.endereco, criado);
    }
  }

  private converterInformacoesDns(registros: Map<string, Set<string>>, emails: Set<string>, dominioId: number) {
    const informacoes: RegistroInformacaoDominio[] = [];
    registros.forEach((valores, tipo) => {
      informacoes.push({ dominioId, campo: `dns_${tipo}`, valor: Array.from(valores).join(', ') });
    });
    if (emails.size > 0) informacoes.push({ dominioId, campo: 'emails', valor: Array.from(emails).join(', ') });
    return informacoes;
  }
}
