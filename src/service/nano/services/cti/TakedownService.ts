
import { NanoService } from '@/service/nano/NanoService';
import prisma from '@/database';
import { TakedownVerificacaoStatus } from '@prisma/client';

export class TakedownService extends NanoService {
    constructor() {
        super('TakedownService');
        this.initialize();
    }

    initialize() {
        const self = this;
        self.listen('COMMAND_RECEIVED', async (payload) => {
            if (payload.command !== 'takedown_check') {
                return;
            }

            const { id: jobId, args } = payload;
            let takedownId: number;

            try {
                const parsedArgs = JSON.parse(args);
                takedownId = parsedArgs.id;
                if (!takedownId) {
                    throw new Error('ID do takedown não fornecido');
                }
            } catch (error) {
                self.emit('JOB_FAILED', { id: jobId, error: 'Argumentos inválidos' });
                return;
            }

            try {
                const takedown = await prisma.takedown.findUnique({
                    where: { id: takedownId },
                });

                if (!takedown) {
                    self.emit('JOB_FAILED', { id: jobId, error: `Takedown com ID ${takedownId} não encontrado` });
                    return;
                }

                let status: TakedownVerificacaoStatus;
                try {
                    let headers = {};
                    if (takedown.headers) {
                        try {
                            headers = JSON.parse(takedown.headers);
                        } catch (e) {
                            self.emit('JOB_FAILED', { id: jobId, error: `JSON de headers inválido para Takedown ID ${takedown.id}` });
                            return;
                        }
                    }

                    let url = takedown.url;
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = `http://${url}`;
                    }

                    const response = await fetch(url, {
                        method: takedown.metodoHttp,
                        headers: headers,
                        body: takedown.body,
                        redirect: 'follow', // Segue redirecionamentos
                    });

                    // Consideramos ONLINE se a resposta for bem-sucedida (status 2xx) ou um redirecionamento (3xx)
                    status = response.ok || (response.status >= 300 && response.status < 400)
                        ? TakedownVerificacaoStatus.ONLINE
                        : TakedownVerificacaoStatus.OFFLINE;

                } catch (error) {
                    // Erros de rede (ex: DNS não encontrado, conexão recusada) indicam que o site está offline
                    status = TakedownVerificacaoStatus.OFFLINE;
                }

                await prisma.takedown.update({
                    where: { id: takedownId },
                    data: {
                        ultimaVerificacao: new Date(),
                        statusUltimaVerificacao: status,
                    },
                });

                self.emit('JOB_COMPLETED', { id: jobId, result: `Verificação do Takedown ${takedownId} concluída. Status: ${status}` });

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao verificar takedown';
                self.emit('JOB_FAILED', { id: jobId, error: errorMessage });
            }
        });
    }
}
