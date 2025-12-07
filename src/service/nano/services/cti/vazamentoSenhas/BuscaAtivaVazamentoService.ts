import { NanoService } from '@/service/nano/NanoService';
import { clienteTelegramBot } from './buscaAtiva/ClienteTelegramBot';
import { clienteTelegramSessao } from './buscaAtiva/ClienteTelegramSessao';
import { linhaComandoCti, saidaBrutaCti } from '../registroExecucaoCti';

export class BuscaAtivaVazamentoService extends NanoService {
    comando = 'busca_ativa_vazamento_telegram';
    comandoTeste = 'busca_ativa_vazamento_telegram_teste';

    constructor() {
        super('BuscaAtivaVazamentoService');
    }

    initialize() {
        this.listen('COMMAND_RECEIVED', async ({ command, id, args }) => {
            if (command !== this.comando && command !== this.comandoTeste) return;
            const alvo = args?.parametrosFonte?.canalOuGrupo || args?.parametrosFonte?.idGrupo || 'Canal não definido';
            const metodo = args?.metodoAutenticacao === 'BOT' ? 'BOT' : 'SESSAO';
            const cliente = metodo === 'SESSAO' ? clienteTelegramSessao : clienteTelegramBot;
            const entrada = {
                alvo,
                extensoes: args?.extensoes,
                ultimaCapturaSucesso: args?.ultimaCapturaSucesso,
                destinoCentral: args?.destinoCentral,
                credenciais: args?.credenciais,
                nomeSessao: args?.nomeSessao,
                tokenBot: args?.tokenBot,
                parametrosFonte: args?.parametrosFonte,
                etapaTeste: args?.etapaTeste,
            };
            try {
                const resultado =
                    command === this.comandoTeste
                        ? await cliente.testar(entrada)
                        : await cliente.executar(entrada);
                const executedCommand = linhaComandoCti(command, entrada);
                const rawOutput = saidaBrutaCti(resultado);
                this.bus.emit('JOB_COMPLETED', {
                    id,
                    result: { ...resultado, metodoAutenticacao: metodo, tipo: command === this.comandoTeste ? 'TESTE' : 'EXECUCAO' },
                    executedCommand,
                    rawOutput,
                });
            } catch (erro) {
                this.bus.emit('JOB_FAILED', { id, error: erro });
            }
        });
    }
}
