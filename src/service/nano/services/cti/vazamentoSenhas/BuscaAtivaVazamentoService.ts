import { NanoService } from '@/service/nano/NanoService';
import { clienteTelegramBot } from './buscaAtiva/ClienteTelegramBot';
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
            try {
                const resultado =
                    metodo === 'SESSAO'
                        ? await clienteTelegramSessao.executar({
                              fonteId: args?.fonteId,
                              alvo,
                              extensoes: args?.extensoes,
                              ultimaCapturaSucesso: args?.ultimaCapturaSucesso,
                              destinoCentral: args?.destinoCentral,
                              credenciais: args?.credenciais,
                              nomeSessao: args?.nomeSessao,
                          })
                        : await clienteTelegramBot.executar({
                              fonteId: args?.fonteId,
                              alvo,
                              extensoes: args?.extensoes,
                              ultimaCapturaSucesso: args?.ultimaCapturaSucesso,
                              destinoCentral: args?.destinoCentral,
                              tokenBot: args?.tokenBot,
                          });
                this.bus.emit('JOB_COMPLETED', {
                    id,
                    result: { ...resultado, metodoAutenticacao: metodo },
                });
            } catch (erro) {
                this.bus.emit('JOB_FAILED', { id, error: erro });
            }
        });
    }
}
