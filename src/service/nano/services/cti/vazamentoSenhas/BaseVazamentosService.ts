import { NanoService } from '@/service/nano/NanoService';

export class BaseVazamentosService extends NanoService {
    comando = 'base_vazamentos';

    constructor() {
        super('BaseVazamentosService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', ({ command, id }) => {
            if (command !== this.comando) return;
            this.bus.emit('JOB_COMPLETED', { id, result: 'Base consolidada de vazamentos aguardando modelos de armazenamento.' });
        });
    }
}
