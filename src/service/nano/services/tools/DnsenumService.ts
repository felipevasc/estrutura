import { NanoService } from '../../NanoService';
import prisma from '@/database';
import Database from '@/database/Database';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { NanoEvents } from '../../events';
import { TipoIp } from '@/database/functions/ip';
import { TipoDominio } from '@prisma/client';
import dns from 'node:dns/promises';

const DEFAULT_WORDLIST_URL = 'https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/DNS/subdomains-top1million-5000.txt';

export class DnsenumService extends NanoService {
  constructor() {
    super('DnsenumService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'dnsenum') {
        this.processarComando(payload);
      }
    });

    this.listen(NanoEvents.DNSENUM_TERMINAL_RESULT, (payload) => this.processarResultado(payload));
    this.listen(NanoEvents.DNSENUM_TERMINAL_ERROR, (payload) => this.processarErro(payload));
  }

  private async processarComando(payload: any) {
    const { id, args, projectId } = payload;
    const { idDominio, threads, wordlist } = args;
    this.log(`Processando dnsenum para domínio ${idDominio}`);
    try {
        const registroDominio = await prisma.dominio.findFirst({ where: { id: Number(idDominio) } });
        const dominioNormalizado = this.normalizarDominio(registroDominio?.endereco ?? '');
        if (!dominioNormalizado) throw new Error('Domínio não encontrado');
        await this.validarDominio(dominioNormalizado);
        const caminhoWordlist = await this.resolverWordlist(wordlist);
        const nomeArquivoSaida = `dnsenum_${projectId}_${id}_${Date.now()}.xml`;
        const caminhoSaida = path.join(os.tmpdir(), nomeArquivoSaida);
        const argumentos = this.montarArgumentos(dominioNormalizado, threads, caminhoWordlist, caminhoSaida);
        this.bus.emit(NanoEvents.EXECUTE_TERMINAL, {
            id: id,
            command: 'dnsenum',
            args: argumentos,
            outputFile: caminhoSaida,
            replyTo: NanoEvents.DNSENUM_TERMINAL_RESULT,
            errorTo: NanoEvents.DNSENUM_TERMINAL_ERROR,
            meta: { projectId, dominio: dominioNormalizado, outputFile: caminhoSaida }
        });
    } catch (e: any) {
        this.bus.emit(NanoEvents.JOB_FAILED, {
            id: id,
            error: e.message
        });
    }
  }

  private normalizarDominio(endereco: string) {
    if (!endereco) return '';
    const enderecoLimpo = endereco.trim();
    if (!enderecoLimpo) return '';
    try {
        const url = enderecoLimpo.includes('://') ? new URL(enderecoLimpo) : new URL(`http://${enderecoLimpo}`);
        return url.hostname.toLowerCase();
    } catch (e) {
        return enderecoLimpo.split('/')[0].toLowerCase();
    }
  }

  private async validarDominio(dominio: string) {
    try {
        await dns.resolveNs(dominio);
    } catch (erro: any) {
        const codigo = erro?.code ?? '';
        if (['ENODATA', 'ENOTFOUND', 'SERVFAIL', 'REFUSED'].includes(codigo)) {
            throw new Error('Domínio inválido ou sem registros NS');
        }
        throw erro;
    }
  }

  private async resolverWordlist(caminhoInformado?: string) {
    const caminhoPadrao = path.join(process.cwd(), 'db/wordlists/subdomains.txt');
    const caminhoEscolhido = caminhoInformado && caminhoInformado.trim().length > 0 ? caminhoInformado.trim() : caminhoPadrao;
    const caminhoFinal = path.isAbsolute(caminhoEscolhido) ? caminhoEscolhido : path.join(process.cwd(), caminhoEscolhido);
    if (fs.existsSync(caminhoFinal)) return caminhoFinal;
    if (caminhoFinal !== caminhoPadrao) throw new Error(`Wordlist inválida ou não encontrada: ${caminhoInformado}`);
    const pasta = path.dirname(caminhoFinal);
    if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
    const resposta = await fetch(DEFAULT_WORDLIST_URL);
    if (!resposta.ok) throw new Error(`Falha ao baixar wordlist: ${resposta.statusText}`);
    const conteudo = await resposta.text();
    fs.writeFileSync(caminhoFinal, conteudo);
    return caminhoFinal;
  }

  private montarArgumentos(dominio: string, threads?: number, wordlist?: string, caminhoSaida?: string) {
    const argumentos = ['--noreverse'];
    if (caminhoSaida) argumentos.push('-o', caminhoSaida);
    argumentos.push('--threads', String(threads || 5));
    if (wordlist) argumentos.push('-f', wordlist);
    argumentos.push(dominio);
    return argumentos;
  }

  private async processarResultado(payload: any) {
      const { id, meta } = payload;
      const { projectId, outputFile } = meta;
      try {
        if (!fs.existsSync(outputFile)) {
             throw new Error('Arquivo de saída não encontrado');
        }
        const conteudoXml = fs.readFileSync(outputFile, 'utf-8');
        const hosts = /<host>([\s\S]*?)<\/host>/g;
        let grupo;
        const subdominios: string[] = [];
        const ips: TipoIp[] = [];
        while ((grupo = hosts.exec(conteudoXml)) !== null) {
            const trecho = grupo[1];
            const hostEncontrado = /<hostname>(.*?)<\/hostname>/.exec(trecho);
            if (hostEncontrado) {
                const host = hostEncontrado[1].trim();
                subdominios.push(host);
                const ipRegex = /<ip>(.*?)<\/ip>/g;
                let captura;
                while ((captura = ipRegex.exec(trecho)) !== null) {
                    const ip = captura[1].trim();
                    if (ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
                         ips.push({ endereco: ip, dominio: host });
                    }
                }
            }
        }
        const arquivosIps = this.localizarArquivosIps(meta?.dominio);
        for (const arquivo of arquivosIps) {
            const ipsArquivo = this.extrairIpsArquivo(arquivo, meta?.dominio);
            for (const ip of ipsArquivo) ips.push(ip);
        }
        const subdominiosUnicos = Array.from(new Set(subdominios));
        const ipsUnicos = Array.from(new Map(ips.map((ip) => [`${ip.endereco}|${ip.dominio}`, ip])).values());
        if (subdominiosUnicos.length > 0) await Database.adicionarSubdominio(subdominiosUnicos, projectId, TipoDominio.dns);
        if (ipsUnicos.length > 0) await Database.adicionarIp(ipsUnicos, projectId);
        this.limparArquivos([outputFile, ...arquivosIps]);
        this.bus.emit(NanoEvents.JOB_COMPLETED, {
            id: id,
            result: { subdominios: subdominiosUnicos.length, ips: ipsUnicos.length }
        });
      } catch (e: any) {
          this.limparArquivos([outputFile, ...this.localizarArquivosIps(meta?.dominio)]);
          this.bus.emit(NanoEvents.JOB_FAILED, {
              id: id,
              error: e.message
          });
      }
  }

  private processarErro(payload: any) {
      const { id, error, stderr, meta } = payload;
      const mensagemErro = stderr ? `${error} - Detalhes: ${stderr}` : error;
      const mensagemNormalizada = mensagemErro?.toUpperCase() ?? '';
      this.limparArquivos([meta?.outputFile, ...this.localizarArquivosIps(meta?.dominio)]);
      if (mensagemNormalizada.includes('NXDOMAIN') || mensagemNormalizada.includes('NS RECORD')) {
        this.bus.emit(NanoEvents.JOB_FAILED, {
            id: id,
            error: 'Domínio inválido ou sem resposta DNS para o dnsenum'
        });
        return;
      }
      this.bus.emit(NanoEvents.JOB_FAILED, {
          id: id,
          error: mensagemErro
      });
  }

  private localizarArquivosIps(dominio?: string) {
    if (!dominio) return [] as string[];
    const nome = `${dominio}_ips.txt`;
    const caminho = path.join(process.cwd(), nome);
    return fs.existsSync(caminho) ? [caminho] : [];
  }

  private extrairIpsArquivo(caminho: string, dominio?: string) {
    const conteudo = fs.readFileSync(caminho, 'utf-8');
    const encontrados = conteudo.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [];
    return encontrados.map((ip) => ({ endereco: ip, dominio: dominio || '' }));
  }

  private limparArquivos(caminhos: (string | undefined)[]) {
    for (const caminho of caminhos) {
        if (!caminho) continue;
        if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
    }
  }
}
