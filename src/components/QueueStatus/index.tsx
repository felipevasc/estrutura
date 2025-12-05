import { Drawer, Button, Tabs, Tag, Popconfirm, Spin } from 'antd';
import { UnorderedListOutlined, DeleteOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import useApi from '@/api';
import { Command, CommandStatus } from '@prisma/client';
import { StyledQueueStatus } from './styles';
import StoreContext from '@/store';
import { VscTerminal } from "react-icons/vsc";
import AnsiToHtml from 'ansi-to-html';

type SecaoFila = 'executando' | 'pendentes' | 'historico';

type MapaSecao<T> = Record<SecaoFila, T>;

const statusSecao: MapaSecao<CommandStatus[]> = {
    executando: ['RUNNING'],
    pendentes: ['PENDING'],
    historico: ['COMPLETED', 'FAILED'],
};

const limitesSecao: MapaSecao<number> = {
    executando: 5,
    pendentes: 5,
    historico: 3,
};

const QueueStatus = () => {
    const conversorAnsi = new AnsiToHtml();
    const [aberto, definirAberto] = useState(false);
    const [expandidos, definirExpandidos] = useState<Record<number, boolean>>({});
    const [comandosSecao, definirComandosSecao] = useState<MapaSecao<Command[]>>({ executando: [], pendentes: [], historico: [] });
    const [totaisSecao, definirTotaisSecao] = useState<MapaSecao<number>>({ executando: 0, pendentes: 0, historico: 0 });
    const [carregandoSecao, definirCarregandoSecao] = useState<MapaSecao<boolean>>({ executando: false, pendentes: false, historico: false });
    const api = useApi();
    const { projeto } = useContext(StoreContext);
    const intervalo = useRef<NodeJS.Timeout>(null);

    const idProjeto = projeto?.get()?.id;

    const limparIntervalo = () => {
        if (intervalo.current) clearTimeout(intervalo.current);
    };

    const obterLimiteAtual = (secao: SecaoFila, anexar: boolean) => {
        if (anexar) return limitesSecao[secao];
        return Math.max(limitesSecao[secao], comandosSecao[secao].length || limitesSecao[secao]);
    };

    const carregarSecao = useCallback(async (secao: SecaoFila, anexar = false) => {
        if (!idProjeto) return;
        definirCarregandoSecao(valor => ({ ...valor, [secao]: true }));
        try {
            const inicio = anexar ? comandosSecao[secao].length : 0;
            const limite = obterLimiteAtual(secao, anexar);
            const resposta = await api.queue.getCommands({
                projectId: idProjeto,
                status: statusSecao[secao],
                limite,
                inicio,
            });
            const registros = resposta.registros as Command[];
            definirComandosSecao(valor => ({
                ...valor,
                [secao]: anexar ? [...valor[secao], ...registros] : registros,
            }));
            definirTotaisSecao(valor => ({ ...valor, [secao]: resposta.total }));
            definirExpandidos(valor => {
                const atualizados = { ...valor };
                registros.forEach(registro => {
                    if (atualizados[registro.id] === undefined) atualizados[registro.id] = true;
                });
                return atualizados;
            });
        } catch (erro) {
            console.error("Falha ao buscar comandos da seção", erro);
        } finally {
            definirCarregandoSecao(valor => ({ ...valor, [secao]: false }));
        }
    }, [api.queue, comandosSecao, idProjeto]);

    const carregarTodasSecoes = useCallback(() => {
        carregarSecao('executando');
        carregarSecao('pendentes');
        carregarSecao('historico');
        limparIntervalo();
        intervalo.current = setTimeout(carregarTodasSecoes, 30000);
    }, [carregarSecao]);

    useEffect(() => {
        definirComandosSecao({ executando: [], pendentes: [], historico: [] });
        definirTotaisSecao({ executando: 0, pendentes: 0, historico: 0 });
        definirExpandidos({});
        limparIntervalo();
        carregarTodasSecoes();
        return () => limparIntervalo();
    }, [carregarTodasSecoes, idProjeto]);

    const cancelarComando = async (id: number) => {
        try {
            await api.queue.cancelCommand(id);
            carregarTodasSecoes();
        } catch (erro) {
            console.error("Falha ao cancelar comando", erro);
        }
    };

    const abrirPainel = () => definirAberto(true);
    const fecharPainel = () => definirAberto(false);

    const comandosExecutando = comandosSecao.executando;
    const comandosPendentes = comandosSecao.pendentes;
    const comandosHistorico = comandosSecao.historico;

    const obterEtiquetaStatus = (status: CommandStatus) => {
        switch (status) {
            case 'RUNNING': return <Tag icon={<LoadingOutlined spin />} color="processing">Executando</Tag>;
            case 'PENDING': return <Tag color="warning">Aguardando</Tag>;
            case 'COMPLETED': return <Tag icon={<CheckCircleOutlined />} color="success">Concluído</Tag>;
            case 'FAILED': return <Tag icon={<CloseCircleOutlined />} color="error">Falhou</Tag>;
            default: return <Tag>Desconhecido</Tag>;
        }
    };

    const interpretarParametros = (conteudo: string) => {
        if (!conteudo) return null;
        try {
            return JSON.parse(conteudo);
        } catch {
            return null;
        }
    };

    const formatarParametros = (conteudo: string) => {
        const parametros = interpretarParametros(conteudo);
        if (!parametros) return conteudo;
        if (Array.isArray(parametros)) return parametros.join(' ');
        if (typeof parametros === 'object') return Object.entries(parametros).map(([chave, valor]) => `${chave}=${typeof valor === 'object' ? JSON.stringify(valor) : valor}`).join(' ');
        return `${parametros}`;
    };

    const montarLinhaComando = (comando: Command) => {
        if (comando.executedCommand) return comando.executedCommand;
        const parametros = formatarParametros(comando.args);
        if (parametros && parametros.trim().length > 0) return `${comando.command} ${parametros}`.trim();
        return comando.command;
    };

    const obterSaida = (comando: Command) => {
        const conteudo = comando.rawOutput || comando.output;
        if (conteudo) return conteudo;
        if (comando.status === 'RUNNING') return 'Comando em execução...';
        if (comando.status === 'PENDING') return 'Aguardando execução...';
        return 'Nenhum resultado disponível.';
    };

    const converterSaida = (conteudo: string) => conversorAnsi.toHtml(conteudo || '');

    const renderizarTerminais = (dados: Command[], permitirCancelar: boolean) => (
        <div className="lista-terminais">
            {dados.map(item => {
                const comandoFormatado = montarLinhaComando(item);
                const aberto = expandidos[item.id] ?? true;
                const alternarTerminal = () => definirExpandidos(valorAnterior => ({ ...valorAnterior, [item.id]: !aberto }));
                return (
                    <div key={item.id} className="terminal-cartao">
                        <div className="terminal-barra">
                            <div className="terminal-titulo" onClick={alternarTerminal}>
                                <div className="terminal-dots">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <VscTerminal />
                                <span>{comandoFormatado}</span>
                            </div>
                            <div className="terminal-acoes">
                                {obterEtiquetaStatus(item.status)}
                                <Button icon={aberto ? <UpOutlined /> : <DownOutlined />} onClick={alternarTerminal} shape="circle" />
                                {permitirCancelar && (
                                    <Popconfirm
                                        title="Cancelar comando?"
                                        onConfirm={() => cancelarComando(item.id)}
                                        okText="Sim"
                                        cancelText="Não"
                                    >
                                        <Button icon={<DeleteOutlined />} type="primary" danger shape="circle" />
                                    </Popconfirm>
                                )}
                            </div>
                        </div>
                        {aberto && (
                            <div className="terminal-corpo">
                                <div className="terminal-cabecalho">
                                    <span className="terminal-sessao">root@kali</span>
                                    <span className="terminal-local">~/estrutura</span>
                                </div>
                                <div className="terminal-linha">
                                    <span className="terminal-prompt">#</span>
                                    <span className="terminal-comando">{comandoFormatado}</span>
                                </div>
                                <div className="terminal-resultado">
                                    <pre dangerouslySetInnerHTML={{ __html: converterSaida(obterSaida(item)) }} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    const montarConteudoSecao = (secao: SecaoFila, permitirCancelar: boolean) => {
        const dados = comandosSecao[secao];
        const carregando = carregandoSecao[secao];
        const possuiMais = dados.length < totaisSecao[secao];

        return (
            <div className="historico-conteudo">
                {carregando && !dados.length ? <Spin /> : renderizarTerminais(dados, permitirCancelar)}
                {possuiMais && (
                    <div className="historico-acoes">
                        <Button type="primary" ghost onClick={() => carregarSecao(secao, true)} loading={carregando}>
                            Carregar mais
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const itens = [
        {
            key: '1',
            label: `Executando (${totaisSecao.executando})`,
            children: montarConteudoSecao('executando', false),
        },
        {
            key: '2',
            label: `Aguardando (${totaisSecao.pendentes})`,
            children: montarConteudoSecao('pendentes', true),
        },
        {
            key: '3',
            label: 'Histórico',
            children: montarConteudoSecao('historico', false),
        },
    ];

    const totalPendentes = totaisSecao.executando + totaisSecao.pendentes;

    return (
        <StyledQueueStatus>
            <Button
                type="primary"
                icon={<UnorderedListOutlined />}
                onClick={abrirPainel}
                size="large"
            >
                Fila de Execução ({totalPendentes})
            </Button>
            <Drawer title="Fila de Execução" placement="right" onClose={fecharPainel} open={aberto} width={900}>
                <Tabs defaultActiveKey="1" items={itens} />
            </Drawer>
        </StyledQueueStatus>
    );
};

export default QueueStatus;
