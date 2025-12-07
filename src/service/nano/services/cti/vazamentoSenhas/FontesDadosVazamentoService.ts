import { NanoService } from '@/service/nano/NanoService';
import prisma from '@/database';
import { FonteVazamentoTipo } from '@prisma/client';
import { linhaComandoCti, saidaBrutaCti } from '../registroExecucaoCti';

export class FontesDadosVazamentoService extends NanoService {
    comando = 'fontes_dados_vazamento';

    constructor() {
        super('FontesDadosVazamentoService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', async ({ command, id, args }) => {
            if (command !== this.comando) return;
            try {
                const filtros: { tipo?: FonteVazamentoTipo } = {};
                if (args?.tipo) filtros.tipo = args.tipo as FonteVazamentoTipo;
                const fontes = await prisma.fonteVazamento.findMany({ where: filtros, orderBy: { atualizadoEm: 'desc' } });
                const executedCommand = linhaComandoCti(this.comando, args);
                const rawOutput = saidaBrutaCti(fontes);
                this.bus.emit('JOB_COMPLETED', { id, result: fontes, executedCommand, rawOutput });
            } catch {
                this.bus.emit('JOB_FAILED', { id, error: 'Falha ao consultar fontes de vazamento' });
            }
        });
    }
}
