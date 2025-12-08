import { NanoService } from '../../NanoService';
import { NanoEvents } from '../../events';
import prisma from '@/database';
import Database from '@/database/Database';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const executar = promisify(execFile);

type PayloadComando = {
  id: number;
  args: Record<string, unknown>;
  projectId: number;
};

type Registro = { campo: string; valor: string };

export class WhoisDominioService extends NanoService {
  constructor() {
    super('WhoisDominioService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload: any) => {
      if (payload.command === 'whoisDominio') this.processarComando(payload as PayloadComando);
    });
  }

  private async processarComando(payload: PayloadComando) {
    const { id, args } = payload;
    const dominioId = Number(args.idDominio);
    if (!Number.isFinite(dominioId)) {
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: 'Domínio inválido' });
      return;
    }

    try {
      const dominio = await prisma.dominio.findUnique({ where: { id: dominioId } });
      if (!dominio) {
        this.bus.emit(NanoEvents.JOB_FAILED, { id, error: 'Domínio não encontrado' });
        return;
      }

      const informacoes = await this.coletarInformacoes(dominio.endereco ?? '');
      const registros = informacoes.map((registro) => ({ ...registro, dominioId }));
      const salvos = await Database.salvarInformacoesDominio(registros);
      this.bus.emit(NanoEvents.JOB_COMPLETED, { id, result: salvos });
    } catch (e: unknown) {
      const erro = e instanceof Error ? e.message : 'Erro desconhecido';
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: erro });
    }
  }

  private async coletarInformacoes(endereco: string) {
    const mapa = new Map<string, string>();
    const adicionar = (campo: string, valor?: string) => {
      const conteudo = valor?.trim();
      if (conteudo) mapa.set(campo, conteudo);
    };

    const fontes = [await this.buscarRdap(endereco), await this.buscarWhois(endereco)];
    fontes.flat().forEach((registro) => adicionar(registro.campo, registro.valor));

    return Array.from(mapa.entries()).map(([campo, valor]) => ({ campo, valor }));
  }

  private async buscarRdap(endereco: string): Promise<Registro[]> {
    try {
      const resposta = await fetch(`https://rdap.org/domain/${endereco}`);
      if (!resposta.ok) return [];
      const dados = await resposta.json();
      return this.extrairRdap(dados);
    } catch {
      return [];
    }
  }

  private extrairRdap(dados: any): Registro[] {
    const lista: Registro[] = [];
    const adicionar = (campo: string, valor?: string) => {
      if (valor) lista.push({ campo, valor });
    };

    adicionar('registrador', dados?.registrarName ?? dados?.registrar);

    const eventos = Array.isArray(dados?.events) ? dados.events : [];
    const evento = (tipo: string) => eventos.find((item: any) => item?.eventAction === tipo)?.eventDate as string | undefined;
    adicionar('dataCriacao', this.normalizarData(evento('registration')));
    adicionar('dataAtualizacao', this.normalizarData(evento('last changed') ?? evento('last update')));
    adicionar('dataExpiracao', this.normalizarData(evento('expiration')));

    const entidade = (dados?.entities ?? []).find((ent: any) => (ent?.roles ?? []).includes('registrant')) ?? dados?.entities?.[0];
    const vcard = this.extrairVcard(entidade?.vcardArray);
    adicionar('registrante', vcard.nome);
    adicionar('organizacao', vcard.organizacao);
    adicionar('email', vcard.email);
    adicionar('telefone', vcard.telefone);
    adicionar('pais', vcard.pais);
    adicionar('estado', vcard.estado);
    adicionar('cidade', vcard.cidade);

    const nomes = Array.isArray(dados?.nameservers) ? dados.nameservers : [];
    const dns = nomes
      .map((item: any) => item?.ldhName ?? item?.unicodeName)
      .filter((nome: unknown): nome is string => typeof nome === 'string');
    if (dns.length) adicionar('dns', dns.join(', '));

    return lista;
  }

  private extrairVcard(vcard?: unknown) {
    const campos = Array.isArray(vcard) && Array.isArray(vcard[1]) ? (vcard[1] as unknown[]) : [];
    const buscar = (chave: string) => {
      const entrada = campos.find((item: any) => Array.isArray(item) && item[0] === chave);
      if (!entrada) return '';
      const valor = (entrada as any)[3];
      if (Array.isArray(valor)) return String(valor[0] ?? '');
      return String(valor ?? '');
    };

    const enderecoBruto = campos.find((item: any) => Array.isArray(item) && item[0] === 'adr');
    const endereco = Array.isArray(enderecoBruto) && Array.isArray((enderecoBruto as any)[3]) ? (enderecoBruto as any)[3] as unknown[] : [];

    return {
      nome: buscar('fn'),
      organizacao: buscar('org'),
      email: buscar('email'),
      telefone: buscar('tel'),
      pais: String(endereco[6] ?? ''),
      estado: String(endereco[4] ?? ''),
      cidade: String(endereco[3] ?? ''),
    };
  }

  private async buscarWhois(endereco: string): Promise<Registro[]> {
    try {
      const { stdout } = await executar('whois', [endereco], { timeout: 20000 });
      return this.extrairWhois(stdout);
    } catch {
      return [];
    }
  }

  private extrairWhois(saida: string): Registro[] {
    const linhas = saida.split('\n').map((linha) => linha.trim()).filter(Boolean);
    const registros = new Map<string, string>();
    const adicionar = (campo: string, valor?: string) => {
      if (valor) registros.set(campo, valor);
    };

    const extrair = (prefixo: string) => {
      const linha = linhas.find((l) => l.toLowerCase().startsWith(prefixo.toLowerCase()));
      if (!linha) return undefined;
      return linha.substring(prefixo.length).replace(/^[\s:]+/, '').trim();
    };

    adicionar('registrador', extrair('Registrar:'));
    adicionar('registrante', extrair('Registrant Name:'));
    adicionar('organizacao', extrair('Registrant Organization:'));
    adicionar('email', extrair('Registrant Email:') ?? extrair('Registrar Abuse Contact Email:'));
    adicionar('pais', extrair('Registrant Country:'));
    adicionar('estado', extrair('Registrant State/Province:'));
    adicionar('cidade', extrair('Registrant City:'));
    adicionar('dataCriacao', this.normalizarData(extrair('Creation Date:')));
    adicionar('dataAtualizacao', this.normalizarData(extrair('Updated Date:')));
    adicionar('dataExpiracao', this.normalizarData(extrair('Registry Expiry Date:')));

    const dns = linhas
      .filter((linha) => linha.toLowerCase().startsWith('name server'))
      .map((linha) => linha.split(/:\s*/i).slice(1).join(':').trim())
      .filter((item) => item.length > 0);
    if (dns.length) adicionar('dns', Array.from(new Set(dns)).join(', '));

    return Array.from(registros.entries()).map(([campo, valor]) => ({ campo, valor }));
  }

  private normalizarData(valor?: string) {
    if (!valor) return '';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;
    return data.toISOString();
  }
}
