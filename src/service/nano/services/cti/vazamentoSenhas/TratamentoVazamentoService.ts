import { NanoService } from '@/service/nano/NanoService';

export class TratamentoVazamentoService extends NanoService {
    comando = 'tratamento_vazamento';

    constructor() {
        super('TratamentoVazamentoService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', ({ command, id }) => {
            if (command !== this.comando) return;
            this.bus.emit('JOB_COMPLETED', { id, result: 'Fluxos de higienização e triagem de vazamentos serão centralizados aqui.' });
        });
    }
}
