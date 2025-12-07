import { NanoService } from '@/service/nano/NanoService';
import { linhaComandoCti, saidaBrutaCti } from '../registroExecucaoCti';

export class BaseVazamentosService extends NanoService {
    comando = 'base_vazamentos';

    constructor() {
        super('BaseVazamentosService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', ({ command, id }) => {
            if (command !== this.comando) return;
            const executedCommand = linhaComandoCti(this.comando);
            const rawOutput = saidaBrutaCti('Base consolidada de vazamentos aguardando modelos de armazenamento.');
            this.bus.emit('JOB_COMPLETED', { id, result: 'Base consolidada de vazamentos aguardando modelos de armazenamento.', executedCommand, rawOutput });
        });
    }
}
