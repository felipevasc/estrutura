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
            try {
                const alvo = args?.parametrosFonte?.canalOuGrupo || args?.parametrosFonte?.idGrupo || 'Canal não definido';
                const metodo = args?.metodoAutenticacao === 'BOT' ? 'BOT' : 'SESSAO';
                if (metodo === 'BOT') throw new Error('Autenticação via bot não implementada');
                const resultado = await clienteTelegramSessao.executar({
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
                        ...resultado,
                        metodoAutenticacao: metodo,
                    },
                });
            } catch (erro: any) {
                this.bus.emit('JOB_FAILED', { id, error: erro?.message || 'Falha ao executar busca ativa no Telegram' });
            }
        });
    }
}
