import prisma from "@/database";
import { NanoService } from "../../NanoService";
import { NanoEvents } from "../../events";

export class CriarTakedownService extends NanoService {
    constructor() {
        super("CriarTakedownService");
        this.defineListeners();
    }

    private defineListeners(): void {
        this.listen(NanoEvents.COMMAND_RECEIVED, (payload) => {
            if (payload.command === 'criar_takedown') {
                this.handleCriarTakedown(payload);
            }
        });
    }

    private async handleCriarTakedown(payload: any): Promise<void> {
        const { id: commandId, args: argsString } = payload;

        try {
            const { url, solicitantes, projetoId } = JSON.parse(argsString);

            const diasPrevisao = parseInt(process.env.TAKEDOWN_DIAS_PREVISAO || '5', 10);
            const previsao = new Date();
            previsao.setDate(previsao.getDate() + diasPrevisao);

            await prisma.takedown.create({
                data: {
                    url,
                    previsao,
                    projetoId,
                    solicitantes: {
                        connectOrCreate: solicitantes.map((nome: string) => ({
                            where: { nome },
                            create: { nome },
                        })),
                    },
                },
                include: {
                    solicitantes: true,
                }
            });

            this.emit(NanoEvents.JOB_COMPLETED, {
                id: commandId,
                message: `Takedown para a URL ${url} foi registrado com sucesso.`
            });

        } catch (error) {
            this.emit(NanoEvents.JOB_FAILED, {
                id: commandId,
                message: `Falha ao processar a solicitação de takedown: ${error.message}`
            });
        }
    }
}
