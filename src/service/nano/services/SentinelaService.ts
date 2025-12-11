import { NanoService } from "../NanoService";
import prisma from "@/database";
import { calcularProximaExecucao } from "@/service/sentinela/calcularProximaExecucao";
import { queueCommand } from "../commandHelper";

export class SentinelaService extends NanoService {
    private intervalo: NodeJS.Timeout | null = null;
    private processando = false;
    private readonly intervaloMs = 30000;

    constructor() {
        super('SentinelaService');
    }

    initialize(): void {
        this.sincronizarProximas();
        this.iniciar();
    }

    private iniciar() {
        if (this.intervalo) return;
        this.intervalo = setInterval(() => this.verificar(), this.intervaloMs);
        this.verificar();
    }

    private async sincronizarProximas() {
        const agendamentos = await prisma.sentinela.findMany({ where: { habilitado: true, proximaExecucao: null } });
        for (const agendamento of agendamentos) {
            const proxima = calcularProximaExecucao(agendamento.cron);
            await prisma.sentinela.update({ where: { id: agendamento.id }, data: { proximaExecucao: proxima } });
        }
    }

    private async verificar() {
        if (this.processando) return;
        this.processando = true;
        try {
            const agora = new Date();
            const agendamentos = await prisma.sentinela.findMany({ where: { habilitado: true, proximaExecucao: { lte: agora } } });
            for (const agendamento of agendamentos) {
                await queueCommand(agendamento.ferramenta, agendamento.parametros, agendamento.projetoId);
                const proxima = calcularProximaExecucao(agendamento.cron);
                await prisma.sentinela.update({ where: { id: agendamento.id }, data: { ultimaExecucao: agora, proximaExecucao: proxima } });
            }
        } catch (erro) {
            this.error('Falha ao processar sentinelas', erro);
        } finally {
            this.processando = false;
        }
    }
}
