import { NanoService } from '@/service/nano/NanoService';
import { linhaComandoCti, saidaBrutaCti } from '../registroExecucaoCti';

export class TratamentoVazamentoService extends NanoService {
    comando = 'tratamento_vazamento';

    constructor() {
        super('TratamentoVazamentoService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', ({ command, id }) => {
            if (command !== this.comando) return;
            const executedCommand = linhaComandoCti(this.comando);
            const rawOutput = saidaBrutaCti('Fluxos de higienização e triagem de vazamentos serão centralizados aqui.');
            this.bus.emit('JOB_COMPLETED', { id, result: 'Fluxos de higienização e triagem de vazamentos serão centralizados aqui.', executedCommand, rawOutput });
        });
    }
}
