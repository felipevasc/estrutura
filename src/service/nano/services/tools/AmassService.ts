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

      const dominio = (op?.endereco ?? '').toLowerCase();

      if (!op?.endereco || !this.validarDominio(dominio)) {
        throw new Error('Domínio inválido ou inseguro fornecido.');
      }

      const baseArquivo = path.join(os.tmpdir(), `amass_${op?.projetoId}_${id}_${Date.now()}`);
      const arquivoJson = `${baseArquivo}.json`;

      const argumentos = ['enum', '-d', dominio, '-timeout', String(timeout), '-oA', baseArquivo];
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
      const dominioRaiz = (op?.endereco ?? '').toLowerCase();

      const arquivoBase = jsonOutputFile?.replace(/\.json$/, '') ?? '';

      if (fs.existsSync(jsonOutputFile)) {
        const conteudo = fs.readFileSync(jsonOutputFile, 'utf-8');
        const itens = this.obterItensJson(conteudo);

        for (const item of itens) {
          this.processarItemJson(item, dominioRaiz, subdominios, ips, registrosDns, emails, aliases);
        }

        fs.unlinkSync(jsonOutputFile);
      }

      const arquivoTexto = arquivoBase ? `${arquivoBase}.txt` : '';
      if (arquivoTexto && fs.existsSync(arquivoTexto)) {
        fs
          .readFileSync(arquivoTexto, 'utf-8')
          .split('\n')
          .map((linha) => linha.trim().toLowerCase())
          .filter(Boolean)
          .forEach((linha) => {
            if (this.eSubdominio(linha, dominioRaiz)) subdominios.add(linha);
          });

        fs.unlinkSync(arquivoTexto);
      }

      const logSaida = lerLogExecucao(jobId) || output || '';
      if (logSaida.trim().length > 0) {
        logSaida
          .split('\n')
          .map((linha) => linha.trim())
          .filter(Boolean)
          .forEach((linha) =>
            this.extrairInformacoesTexto(linha, dominioRaiz, subdominios, ips, registrosDns, emails, aliases)
          );
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
    const alvo = valor.toLowerCase();
    const raiz = dominioRaiz.toLowerCase();
    if (alvo === raiz) return false;
    return alvo.endsWith(`.${raiz}`);
  }

  private obterDominioRelacionado(nome: string, dominioItem: string, dominioRaiz: string) {
    const nomeNormalizado = nome.toLowerCase();
    const dominioNormalizado = dominioItem.toLowerCase();
    const raiz = dominioRaiz.toLowerCase();
    if (this.eSubdominio(nomeNormalizado, raiz)) return nomeNormalizado;
    if (this.eSubdominio(dominioNormalizado, raiz)) return dominioNormalizado;
    if (nomeNormalizado === raiz || dominioNormalizado === raiz) return raiz;
    return '';
  }

  private processarItemJson(
    item: any,
    dominioRaiz: string,
    subdominios: Set<string>,
    ips: TipoIp[],
    registrosDns: Map<string, Set<string>>,
    emails: Set<string>,
    aliases: { origem: string; destino: string }[]
  ) {
    const nomeRegistro = typeof item?.name === 'string' ? item.name.trim().toLowerCase() : '';
    const dominioItem = typeof item?.domain === 'string' ? item.domain.trim().toLowerCase() : '';
    if (this.eSubdominio(nomeRegistro, dominioRaiz)) subdominios.add(nomeRegistro);
    const dominioRelacionado = this.obterDominioRelacionado(nomeRegistro, dominioItem, dominioRaiz);
    if (Array.isArray(item?.addresses)) {
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
    if (Array.isArray(item?.emails)) {
      item.emails.forEach((email: any) => {
        const texto = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (texto) emails.add(texto);
      });
    }
  }

  private obterItensJson(conteudo: string) {
    const texto = conteudo.trim();
    if (!texto) return [] as any[];
    try {
      const dados = JSON.parse(texto);
      if (Array.isArray(dados)) return dados;
      if (Array.isArray((dados as any).results)) return (dados as any).results;
    } catch {}
    const itens: any[] = [];
    texto
      .split('\n')
      .map((linha) => linha.trim())
      .filter(Boolean)
      .forEach((linha) => {
        try {
          const item = JSON.parse(linha);
          itens.push(item);
        } catch {}
      });
    return itens;
  }

  private extrairRegistros(item: any) {
    const lista = Array.isArray(item?.records) ? item.records : Array.isArray(item?.dns_records) ? item.dns_records : [];
    return lista
      .map((registro: any) => {
        const nome = typeof registro.name === 'string' ? registro.name : typeof registro.rrname === 'string' ? registro.rrname : '';
        const tipo = typeof registro.type === 'string' ? registro.type : typeof registro.rrtype === 'string' ? registro.rrtype : '';
        const valor = typeof registro.value === 'string' ? registro.value : typeof registro.rrdata === 'string' ? registro.rrdata : '';
        return { nome: nome.trim().toLowerCase(), tipo: tipo.trim(), valor: valor.trim().toLowerCase() };
      })
      .filter((registro: any) => registro.tipo && registro.valor);
  }

  private agruparRegistroDns(mapa: Map<string, Set<string>>, tipo: string, valor: string) {
    const chave = tipo.toLowerCase();
    if (!mapa.has(chave)) mapa.set(chave, new Set());
    mapa.get(chave)?.add(valor);
  }

  private extrairInformacoesTexto(
    linha: string,
    dominioRaiz: string,
    subdominios: Set<string>,
    ips: TipoIp[],
    registrosDns: Map<string, Set<string>>,
    emails: Set<string>,
    aliases: { origem: string; destino: string }[]
  ) {
    const texto = linha.toLowerCase();
    const registro = texto.match(/^([\w.-]+)[^\w-]+([a-z]+)_record[^\w-]+([\w.-]+)/i);
    if (registro) {
      const origem = registro[1].toLowerCase();
      const tipo = registro[2].toUpperCase();
      const destino = registro[3].toLowerCase();
      if (this.eSubdominio(origem, dominioRaiz)) subdominios.add(origem);
      if (this.eSubdominio(destino, dominioRaiz)) subdominios.add(destino);
      const dominioRelacionado = this.obterDominioRelacionado(origem, origem, dominioRaiz);
      if (dominioRelacionado && destino && tipo === 'A' && destino.match(/^(?:\d{1,3}\.){3}\d{1,3}$/)) {
        ips.push({ endereco: destino, dominio: dominioRelacionado });
      }
      if (origem && destino) {
        this.agruparRegistroDns(registrosDns, tipo, `${origem} -> ${destino}`);
        if (tipo === 'MX') emails.add(destino);
        if (tipo === 'CNAME') aliases.push({ origem, destino });
      }
      return;
    }

    const dominio = texto.split(' ')[0];
    if (this.eSubdominio(dominio, dominioRaiz)) subdominios.add(dominio);
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
        const precisaAtualizar = atual.alias !== alias.destino || (pai?.id && atual.paiId !== pai.id) || atual.tipo !== TipoDominio.alias;
        if (precisaAtualizar) {
          const atualizado = await prisma.dominio.update({ where: { id: atual.id }, data: { alias: alias.destino, paiId: pai?.id ?? atual.paiId ?? null, tipo: TipoDominio.alias } });
          mapa.set(atualizado.endereco, atualizado);
        }
        continue;
      }
      const criado = await prisma.dominio.create({ data: { endereco: alias.origem, alias: alias.destino, projetoId, paiId: pai?.id ?? null, tipo: TipoDominio.alias } });
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
