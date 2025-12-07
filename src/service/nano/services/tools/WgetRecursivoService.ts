import { NanoService } from '../../NanoService';
import prisma from '@/database';
import { NanoEvents } from '../../events';
import { AlvoResolvido, resolverAlvo } from './resolvedorAlvo';
import fs from 'node:fs';
import { lerLogExecucao, obterCaminhoLogExecucao, registrarComandoFerramenta } from './armazenamentoExecucao';

type PayloadComando = {
  id: number;
  args: Record<string, unknown>;
  projectId: number;
};

type ResultadoDiretorio = {
  caminho: string;
  status: number | null;
  tamanho: number | null;
  tipo: 'diretorio' | 'arquivo';
};

type MetadadosRastreamento = AlvoResolvido & {
  projectId: number;
  profundidadeMaxima: number;
  limiteNos: number;
};

type RespostaHttp = {
  status: number | null;
  tamanho: number | null;
  tipoConteudo: string | null;
  html: string | null;
};

export class WgetRecursivoService extends NanoService {
  constructor() {
    super('WgetRecursivoService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
      if (payload.command === 'wgetRecursivo') this.processarComando(payload);
    });
  }

  private async processarComando(payload: PayloadComando) {
    const { id, args, projectId } = payload;
    const argumentosRegistrados = [JSON.stringify(args ?? {})];
    const comandoRegistrado = registrarComandoFerramenta('wgetRecursivo', id, 'wgetRecursivo', argumentosRegistrados);
    const caminhoLog = obterCaminhoLogExecucao(id);

    this.log(`Iniciando wget recursivo para projeto ${projectId}`);

    try {
      const alvo = await resolverAlvo(args);
      const meta: MetadadosRastreamento = {
        ...alvo,
        projectId,
        profundidadeMaxima: this.definirProfundidade(args),
        limiteNos: this.definirLimite(args)
      };

      const registros = await this.rastrear(meta);
      await this.salvar(registros, alvo);
      fs.writeFileSync(caminhoLog, JSON.stringify(registros, null, 2));

        this.bus.emit(NanoEvents.JOB_COMPLETED, {
          id,
          result: registros,
        rawOutput: lerLogExecucao(id) || JSON.stringify(registros),
        executedCommand: comandoRegistrado
        });
    } catch (e: unknown) {
      const erro = e instanceof Error ? e.message : 'Erro desconhecido';
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: erro });
    }
  }

  private definirProfundidade(args: Record<string, unknown>) {
    const valor = Number(args.profundidade);
    return Number.isFinite(valor) && valor > 0 ? Math.floor(valor) : 2;
  }

  private definirLimite(args: Record<string, unknown>) {
    const valor = Number(args.limite);
    return Number.isFinite(valor) && valor > 0 ? Math.floor(valor) : 200;
  }

  private async rastrear(meta: MetadadosRastreamento) {
    const alvo = this.normalizarUrl(meta.alvo);
    const urlBase = new URL(alvo);
    const caminhoBase = this.normalizarCaminhoBase(urlBase.pathname);
    const fila: { url: URL; nivel: number }[] = [{ url: urlBase, nivel: 0 }];
    const visitados = new Set<string>();
    const registros = new Map<string, ResultadoDiretorio>();

    while (fila.length && registros.size < meta.limiteNos) {
      const atual = fila.shift();
      if (!atual) break;

      const chave = this.chaveVisita(atual.url);
      if (visitados.has(chave) || atual.nivel > meta.profundidadeMaxima) continue;
      visitados.add(chave);

      const resposta = await this.fazerRequisicao(atual.url);
      const registro = this.montarRegistro(atual.url, resposta);
      if (registro) registros.set(registro.caminho, registro);
      if (registros.size >= meta.limiteNos) break;

      if (resposta?.html && atual.nivel < meta.profundidadeMaxima) {
        const proximos = this.extrairLinks(resposta.html, atual.url, urlBase, caminhoBase);
        proximos.forEach((proximo) => fila.push({ url: proximo, nivel: atual.nivel + 1 }));
      }
    }

    return Array.from(registros.values());
  }

  private async fazerRequisicao(url: URL): Promise<RespostaHttp> {
    try {
      const resposta = await fetch(url.toString());
      const status = Number.isFinite(resposta.status) ? resposta.status : null;
      const tipoConteudo = resposta.headers.get('content-type');
      const tamanho = this.extrairTamanho(resposta.headers.get('content-length'));
      const html = tipoConteudo && tipoConteudo.includes('text/html') ? await resposta.text() : null;
      return { status, tamanho, tipoConteudo, html };
    } catch {
      return { status: null, tamanho: null, tipoConteudo: null, html: null };
    }
  }

  private montarRegistro(url: URL, resposta: RespostaHttp): ResultadoDiretorio | null {
    const caminho = this.normalizarCaminho(url.pathname);
    if (!caminho) return null;
    const tipo = this.definirTipo(caminho, resposta.tipoConteudo);
    const caminhoAjustado = tipo === 'diretorio' ? this.aplicarBarraResultado(caminho) : caminho;
    return {
      caminho: caminhoAjustado,
      status: resposta.status,
      tamanho: resposta.tamanho,
      tipo
    };
  }

  private definirTipo(caminho: string, tipoConteudo: string | null) {
    if (caminho.endsWith('/')) return 'diretorio';
    if (tipoConteudo && tipoConteudo.includes('text/html')) return 'diretorio';
    return 'arquivo';
  }

  private extrairLinks(html: string, atual: URL, base: URL, caminhoBase: string) {
    const links = new Set<URL>();
    const regex = /href\s*=\s*["']?([^"'\s>]+)/gi;
    let resultado = regex.exec(html);

    while (resultado) {
      const destino = resultado[1];
      try {
        const url = new URL(destino, atual);
        const caminho = this.normalizarCaminho(url.pathname);
        if (url.origin === base.origin && this.caminhoPermitido(caminho, caminhoBase)) links.add(url);
      } catch {}
      resultado = regex.exec(html);
    }

    return Array.from(links.values());
  }

  private caminhoPermitido(caminho: string, caminhoBase: string) {
    if (caminhoBase === '/') return true;
    return caminho.startsWith(caminhoBase);
  }

  private normalizarUrl(alvo: string) {
    const url = new URL(alvo);
    const caminho = this.normalizarCaminho(url.pathname);
    return `${url.origin}${caminho}`;
  }

  private normalizarCaminhoBase(caminho: string) {
    if (!caminho) return '/';
    const normalizado = this.normalizarCaminho(caminho);
    return normalizado.endsWith('/') ? normalizado : `${normalizado}/`;
  }

  private normalizarCaminho(caminho: string) {
    if (!caminho) return '/';
    const base = caminho.startsWith('/') ? caminho : `/${caminho}`;
    return base.replace(/\\+/g, '/');
  }

  private aplicarBarraResultado(caminho: string) {
    return caminho.endsWith('/') ? caminho : `${caminho}/`;
  }

  private chaveVisita(url: URL) {
    const caminho = this.normalizarCaminho(url.pathname);
    return `${url.origin}${caminho}`;
  }

  private extrairTamanho(cabecalho: string | null) {
    const numero = Number(cabecalho);
    return Number.isFinite(numero) ? numero : null;
  }

  private async salvar(registros: ResultadoDiretorio[], alvo: AlvoResolvido) {
    const { dominio, ip } = alvo;
    for (const registro of registros) {
      await prisma.diretorio.create({
        data: {
          caminho: registro.caminho,
          status: registro.status,
          tamanho: registro.tamanho,
          dominioId: dominio ? dominio.id : null,
          ipId: ip ? ip.id : null,
          tipo: registro.tipo
        }
      });
    }
  }
}
