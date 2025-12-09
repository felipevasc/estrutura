import fs from 'node:fs';
import prisma from '@/database';
import { NanoService } from '../../NanoService';
import { NanoEvents } from '../../events';
import { resolverAlvo } from './resolvedorAlvo';
import { lerLogExecucao, obterCaminhoLogExecucao, registrarComandoFerramenta } from './armazenamentoExecucao';
import { ResultadoWhatweb, criarResultadosWhatweb } from '@/database/functions/whatweb';

type PayloadComando = { id: number; args: Record<string, unknown>; projectId: number };

type MetadadosServico = {
  alvo: string;
  dominioId: number | null;
  ipId: number | null;
  portaId: number | null;
  diretorioId: number | null;
};

type RespostaServico = {
  status: number | null;
  cabecalhos: Record<string, string>;
  gerador: string | null;
  tecnologias: string[];
  urlFinal: string;
};

export class DetectorServicoService extends NanoService {
  constructor() {
    super('DetectorServicoService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload: any) => {
      if (payload.command === 'detectarServico') this.processar(payload as PayloadComando);
    });
  }

  private async processar(payload: PayloadComando) {
    const { id, args } = payload;
    const comandoRegistrado = registrarComandoFerramenta('detectarServico', id, 'detectarServico', [JSON.stringify(args ?? {})]);
    const caminhoLog = obterCaminhoLogExecucao(id);

    try {
      const alvoResolvido = await resolverAlvo(args);
      const diretorioId = await this.obterDiretorio(args.idDiretorio);
      const metadados: MetadadosServico = {
        alvo: alvoResolvido.alvo,
        dominioId: alvoResolvido.dominio?.id ?? null,
        ipId: alvoResolvido.ip?.id ?? null,
        portaId: alvoResolvido.porta?.id ?? null,
        diretorioId
      };

      const resposta = await this.coletar(metadados.alvo);
      const resultados = await criarResultadosWhatweb(this.montarResultados(resposta, metadados));
      fs.writeFileSync(caminhoLog, JSON.stringify(resposta, null, 2));

      this.bus.emit(NanoEvents.JOB_COMPLETED, {
        id,
        result: resultados,
        rawOutput: lerLogExecucao(id) || JSON.stringify(resposta),
        executedCommand: comandoRegistrado
      });
    } catch (e: unknown) {
      const erro = e instanceof Error ? e.message : 'Erro desconhecido';
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: erro });
    }
  }

  private async coletar(url: string): Promise<RespostaServico> {
    const resposta = await fetch(url, { redirect: 'follow' });
    const cabecalhos: Record<string, string> = {};
    resposta.headers.forEach((valor, chave) => {
      cabecalhos[chave.toLowerCase()] = valor;
    });
    const corpo = await resposta.text();
    const gerador = this.extrairGerador(corpo, cabecalhos);
    const tecnologias = this.extrairTecnologias(cabecalhos, gerador);
    return { status: resposta.status || null, cabecalhos, gerador, tecnologias, urlFinal: resposta.url || url };
  }

  private extrairGerador(corpo: string, cabecalhos: Record<string, string>) {
    if (cabecalhos['x-generator']) return cabecalhos['x-generator'];
    const match = corpo.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)/i);
    return match ? match[1].trim() : null;
  }

  private extrairTecnologias(cabecalhos: Record<string, string>, gerador: string | null) {
    const lista = new Set<string>();
    ['server', 'x-powered-by', 'x-aspnet-version', 'via'].forEach((chave) => {
      const valor = cabecalhos[chave];
      if (!valor) return;
      valor.split(/[,;]|\s{2,}/).map((item) => item.trim()).filter(Boolean).forEach((item) => lista.add(item));
    });
    if (gerador) lista.add(gerador);
    return Array.from(lista);
  }

  private montarResultados(resposta: RespostaServico, metadados: MetadadosServico): ResultadoWhatweb[] {
    const base = {
      dominioId: metadados.dominioId,
      ipId: metadados.ipId,
      diretorioId: metadados.diretorioId,
      portaId: metadados.portaId
    };

    const resultados: ResultadoWhatweb[] = [];
    if (resposta.status !== null) resultados.push({ plugin: 'Status', valor: `${resposta.status}`, dados: resposta.cabecalhos, ...base });
    if (resposta.cabecalhos['server']) resultados.push({ plugin: 'Servidor', valor: resposta.cabecalhos['server'], dados: resposta.cabecalhos, ...base });
    if (resposta.gerador) resultados.push({ plugin: 'Gerador', valor: resposta.gerador, dados: resposta.cabecalhos, ...base });
    resposta.tecnologias.forEach((tecnologia) => resultados.push({ plugin: 'Tecnologia', valor: tecnologia, dados: resposta.cabecalhos, ...base }));
    if (resposta.urlFinal && resposta.urlFinal !== metadados.alvo) resultados.push({ plugin: 'Destino', valor: resposta.urlFinal, dados: resposta.cabecalhos, ...base });
    return resultados;
  }

  private async obterDiretorio(valor: unknown) {
    const id = Number(valor);
    if (!Number.isFinite(id)) return null;
    const diretorio = await prisma.diretorio.findUnique({ where: { id } });
    return diretorio ? diretorio.id : null;
  }
}
