import { NanoService } from '@/service/nano/NanoService';

export class ComunicacaoVazamentosService extends NanoService {
    comando = 'comunicacao_vazamentos';

    constructor() {
        super('ComunicacaoVazamentosService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', ({ command, id }) => {
            if (command !== this.comando) return;
            this.bus.emit('JOB_COMPLETED', { id, result: 'Trilhas de comunicação de vazamentos prontas para registro de status.' });
        });
    }
}
