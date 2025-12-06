import { NanoService } from '@/service/nano/NanoService';
import prisma from '@/database';
import { PhishingStatus } from '@prisma/client';
import { avaliarPagina, ResultadoFiltro } from './phishing/filtros';

type Payload = { id: number; args: unknown };
type Dados = { dominioId?: number; alvo?: string; html?: string; fonte?: string; termo?: string };

export default class PhishingAnaliseService extends NanoService {
    constructor() {
        super('PhishingAnaliseService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', (payload) => {
            if (payload.command === 'phishing_analisar') {
                this.executar(payload as Payload).catch((erro: unknown) => {
                    const mensagem = erro instanceof Error ? erro.message : 'Falha na análise de phishing';
                    this.error(mensagem, erro as Error);
                });
            }
        });
    }

    private async executar({ id, args }: Payload) {
        try {
            const dadosBrutos = typeof args === 'string' ? JSON.parse(args) : args;
            const dados = dadosBrutos as Dados;
            const dominioId = Number(dados?.dominioId);
            const alvo = String(dados?.alvo || '').trim().toLowerCase();
            const html = String(dados?.html || '');
            const fonte = String(dados?.fonte || 'analise_html').trim() || 'analise_html';
            const termo = String(dados?.termo || fonte).trim() || fonte;
            if (!dominioId || !alvo) {
                this.bus.emit('JOB_FAILED', { id, error: 'Dados insuficientes para análise de phishing' });
                return;
            }

            const dominio = await prisma.dominio.findUnique({ where: { id: dominioId } });
            if (!dominio) {
                this.bus.emit('JOB_FAILED', { id, error: `Domínio ${dominioId} não encontrado` });
                return;
            }

            const avaliacao = avaliarPagina(html);
            if (avaliacao.resultado === ResultadoFiltro.Descartar) {
                this.bus.emit('JOB_COMPLETED', { id, result: { status: 'DESCARTADO', filtro: avaliacao.filtro, detalhe: avaliacao.detalhe } });
                return;
            }

            const status = avaliacao.resultado === ResultadoFiltro.Possivel ? PhishingStatus.POSSIVEL_PHISHING : PhishingStatus.NECESSARIO_ANALISE;
            const existente = await prisma.phishing.findFirst({ where: { alvo, dominioId } });
            if (existente) {
                const atualizado = await prisma.phishing.update({ where: { id: existente.id }, data: { status, termo, fonte } });
                this.bus.emit('JOB_COMPLETED', { id, result: { status: atualizado.status, phishingId: atualizado.id } });
                return;
            }

            const criado = await prisma.phishing.create({ data: { alvo, termo, fonte, dominioId, status } });
            this.bus.emit('JOB_COMPLETED', { id, result: { status: criado.status, phishingId: criado.id } });
        } catch (erro: unknown) {
            const mensagem = erro instanceof Error ? erro.message : 'Erro desconhecido na análise de phishing';
            this.bus.emit('JOB_FAILED', { id, error: mensagem });
        }
    }
}
