
import { NanoService } from '@/service/nano/NanoService';
import prisma from '@/database';
import { TakedownVerificacaoStatus } from '@prisma/client';

export class TakedownService extends NanoService {
    constructor() {
        super('TakedownService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', async (payload) => {
            if (payload.command !== 'takedown_check') {
                return;
            }

            const { id: jobId, args } = payload;
            const takedownId = Number(args?.id);

            if (!takedownId) {
                this.bus.emit('JOB_FAILED', { id: jobId, error: 'ID do takedown não fornecido' });
                return;
            }

            try {
                const takedown = await prisma.takedown.findUnique({
                    where: { id: takedownId },
                });

                if (!takedown) {
                    this.bus.emit('JOB_FAILED', { id: jobId, error: `Takedown com ID ${takedownId} não encontrado` });
                    return;
                }

                let status: TakedownVerificacaoStatus;
                try {
                    let headers = {};
                    if (takedown.headers) {
                        try {
                            headers = JSON.parse(takedown.headers);
                        } catch (e) {
                            this.bus.emit('JOB_FAILED', { id: jobId, error: `JSON de headers inválido para Takedown ID ${takedown.id}` });
                            return;
                        }
                    }

                    let url = takedown.url;
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = `https://${url}`;
                    }
                    const response = await fetch(url, {
                        method: takedown.metodoHttp || 'GET',
                        headers: headers,
                        body: takedown.body,
                        redirect: 'follow', // Segue redirecionamentos
                    });

                    status = response.ok || (response.status >= 300 && response.status < 400)
                        ? TakedownVerificacaoStatus.ONLINE
                        : TakedownVerificacaoStatus.OFFLINE;

                } catch (error) {
                    status = TakedownVerificacaoStatus.OFFLINE;
                }

                await prisma.takedown.update({
                    where: { id: takedownId },
                    data: {
                        ultimaVerificacao: new Date(),
                        statusUltimaVerificacao: status,
                    },
                });

                this.bus.emit('JOB_COMPLETED', { id: jobId, result: `Verificação do Takedown ${takedownId} concluída. Status: ${status}` });

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao verificar takedown';
                this.bus.emit('JOB_FAILED', { id: jobId, error: errorMessage });
            }
        });
    }
}
