import { NanoService } from '@/service/nano/NanoService';
import prisma from '@/database';
import { PhishingVerificacaoStatus } from '@prisma/client';
import { linhaComandoCti, saidaBrutaCti } from './registroExecucaoCti';

export default class PhishingVerificacaoService extends NanoService {
    constructor() {
        super('PhishingVerificacaoService');
        this.initialize();
    }

    initialize() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.listen('COMMAND_RECEIVED', async (payload: any) => {
            if (payload.command !== 'phishing_verificar') return;

            const { id: jobId, args } = payload;
            const phishingId = Number(args?.id);
            if (!phishingId) {
                this.bus.emit('JOB_FAILED', { id: jobId, error: 'ID do phishing não fornecido' });
                return;
            }

            try {
                const registro = await prisma.phishing.findUnique({ where: { id: phishingId } });
                if (!registro) {
                    this.bus.emit('JOB_FAILED', { id: jobId, error: `Phishing ${phishingId} não encontrado` });
                    return;
                }

                const urls = this.obterUrls(registro.alvo);
                let status: PhishingVerificacaoStatus = PhishingVerificacaoStatus.OFFLINE;
                const saidas: string[] = [];

                for (const url of urls) {
                    try {
                        const resposta = await fetch(url, { method: 'GET', redirect: 'follow' });
                        saidas.push(`${url} ${resposta.status}`);
                        if (resposta.ok || (resposta.status >= 300 && resposta.status < 400)) {
                            status = PhishingVerificacaoStatus.ONLINE;
                            break;
                        }
                    } catch (erro) {
                        const mensagem = erro instanceof Error ? erro.message : 'falha ao verificar';
                        saidas.push(`${url} ${mensagem}`);
                    }
                }

                await prisma.phishing.update({
                    where: { id: phishingId },
                    data: { ultimaVerificacao: new Date(), statusUltimaVerificacao: status }
                });

                const executedCommand = linhaComandoCti('phishing_verificar', { phishingId });
                const rawOutput = saidaBrutaCti(saidas);
                this.bus.emit('JOB_COMPLETED', { id: jobId, result: status, executedCommand, rawOutput });
            } catch (erro) {
                const mensagem = erro instanceof Error ? erro.message : 'Erro ao verificar phishing';
                this.bus.emit('JOB_FAILED', { id: jobId, error: mensagem });
            }
        });
    }

    private obterUrls(alvo: string) {
        const host = alvo.replace(/^https?:\/\//, '').split('/')[0];
        return [`http://${host}`, `https://${host}`];
    }
}
