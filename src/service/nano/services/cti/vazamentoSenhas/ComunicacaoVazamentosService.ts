import { NanoService } from '@/service/nano/NanoService';
import { linhaComandoCti, saidaBrutaCti } from '../registroExecucaoCti';

export class ComunicacaoVazamentosService extends NanoService {
    comando = 'comunicacao_vazamentos';

    constructor() {
        super('ComunicacaoVazamentosService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', ({ command, id }) => {
            if (command !== this.comando) return;
            const executedCommand = linhaComandoCti(this.comando);
            const rawOutput = saidaBrutaCti('Trilhas de comunicação de vazamentos prontas para registro de status.');
            this.bus.emit('JOB_COMPLETED', { id, result: 'Trilhas de comunicação de vazamentos prontas para registro de status.', executedCommand, rawOutput });
        });
    }
}
