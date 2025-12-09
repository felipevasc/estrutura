import prisma from '@/database';
import { criarResultadosWhatweb, ResultadoWhatweb } from '@/database/functions/whatweb';
import { NanoService } from '../../NanoService';
import { NanoEvents } from '../../events';
import { resolverAlvo } from './resolvedorAlvo';
import { coletarRespostaTecnologia, detectarFrameworks, registrarLogResposta } from './identificadoresTecnologia';
import { lerLogExecucao, obterCaminhoLogExecucao, registrarComandoFerramenta } from './armazenamentoExecucao';

type PayloadComando = { id: number; args: Record<string, unknown>; projectId: number };

type MetadadosTecnologia = { alvo: string; dominioId: number | null; ipId: number | null; portaId: number | null; diretorioId: number | null };

export class IdentificarFrameworkService extends NanoService {
  constructor() {
    super('IdentificarFrameworkService');
  }

  initialize(): void {
    this.listen(NanoEvents.COMMAND_RECEIVED, (payload: any) => {
      if (payload.command === 'identificarFramework') this.processar(payload as PayloadComando);
    });
  }

  private async processar(payload: PayloadComando) {
    const { id, args } = payload;
    const comandoRegistrado = registrarComandoFerramenta('identificarFramework', id, 'identificarFramework', [JSON.stringify(args ?? {})]);
    const caminhoLog = obterCaminhoLogExecucao(id);

    try {
      const alvoResolvido = await resolverAlvo(args);
      const diretorioId = await this.obterDiretorio(args.idDiretorio);
      const metadados: MetadadosTecnologia = {
        alvo: alvoResolvido.alvo,
        dominioId: alvoResolvido.dominio?.id ?? null,
        ipId: alvoResolvido.ip?.id ?? null,
        portaId: alvoResolvido.porta?.id ?? null,
        diretorioId
      };

      const resposta = await coletarRespostaTecnologia(metadados.alvo);
      registrarLogResposta(caminhoLog, resposta);
      const frameworks = detectarFrameworks(resposta);
      const resultados = await criarResultadosWhatweb(this.montarResultados(frameworks, metadados, resposta));

      this.bus.emit(NanoEvents.JOB_COMPLETED, {
        id,
        result: resultados,
        rawOutput: lerLogExecucao(id),
        executedCommand: comandoRegistrado
      });
    } catch (e: unknown) {
      const erro = e instanceof Error ? e.message : 'Erro desconhecido';
      this.bus.emit(NanoEvents.JOB_FAILED, { id, error: erro });
    }
  }

  private montarResultados(frameworks: { nome: string; evidencias: string[] }[], metadados: MetadadosTecnologia, resposta: { url: string; cabecalhos: Record<string, string>; caminho: string }): ResultadoWhatweb[] {
    const base = {
      dominioId: metadados.dominioId,
      ipId: metadados.ipId,
      portaId: metadados.portaId,
      diretorioId: metadados.diretorioId,
    };

    return frameworks.map((framework) => ({
      plugin: 'Framework/CMS',
      valor: framework.nome,
      dados: { evidencias: framework.evidencias, url: resposta.url, caminho: resposta.caminho, cabecalhos: resposta.cabecalhos },
      ...base
    }));
  }

  private async obterDiretorio(valor: unknown) {
    const id = Number(valor);
    if (!Number.isFinite(id)) return null;
    const diretorio = await prisma.diretorio.findUnique({ where: { id } });
    return diretorio ? diretorio.id : null;
  }
}
