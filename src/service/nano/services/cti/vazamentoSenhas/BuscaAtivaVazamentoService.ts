import { NanoService } from '@/service/nano/NanoService';
import { clienteTelegramSessao } from './buscaAtiva/ClienteTelegramSessao';

export class BuscaAtivaVazamentoService extends NanoService {
    comando = 'busca_ativa_vazamento_telegram';

    constructor() {
        super('BuscaAtivaVazamentoService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', async ({ command, id, args }) => {
            if (command !== this.comando) return;
            const alvo = args?.parametrosFonte?.canalOuGrupo || args?.parametrosFonte?.idGrupo || 'Canal não definido';
            const metodo = args?.metodoAutenticacao === 'BOT' ? 'BOT' : 'SESSAO';
            if (metodo === 'SESSAO')
                await clienteTelegramSessao.executar({
                    fonteId: args?.fonteId,
                    alvo,
                    extensoes: args?.extensoes,
                    ultimaCapturaSucesso: args?.ultimaCapturaSucesso,
                    destinoCentral: args?.destinoCentral,
                    credenciais: args?.credenciais,
                    nomeSessao: args?.nomeSessao,
                });
            this.bus.emit('JOB_COMPLETED', {
                id,
                result: {
                    fonteId: args?.fonteId,
                    alvo,
                    extensoes: args?.extensoes,
                    ultimaCapturaSucesso: args?.ultimaCapturaSucesso,
                    destinoCentral: args?.destinoCentral,
                    metodoAutenticacao: metodo,
                    nomeSessao: args?.nomeSessao,
                },
            });
        });
    }
}
