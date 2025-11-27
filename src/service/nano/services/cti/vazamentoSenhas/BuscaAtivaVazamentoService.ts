import { NanoService } from '@/service/nano/NanoService';

export class BuscaAtivaVazamentoService extends NanoService {
    comando = 'busca_ativa_vazamento_telegram';

    constructor() {
        super('BuscaAtivaVazamentoService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', ({ command, id, args }) => {
            if (command !== this.comando) return;
            const alvo = args?.parametrosFonte?.canalOuGrupo || args?.parametrosFonte?.idGrupo || 'Canal não definido';
            this.bus.emit('JOB_COMPLETED', {
                id,
                result: {
                    fonteId: args?.fonteId,
                    alvo,
                    extensoes: args?.extensoes,
                    ultimaCapturaSucesso: args?.ultimaCapturaSucesso,
                    destinoCentral: args?.destinoCentral,
                },
            });
        });
    }
}
