import { Drawer, Button, Tabs, Tag, Popconfirm } from 'antd';
import { UnorderedListOutlined, DeleteOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { useContext, useEffect, useRef, useState } from 'react';
import useApi from '@/api';
import { Command, CommandStatus } from '@prisma/client';
import { StyledQueueStatus } from './styles';
import StoreContext from '@/store';
import { VscTerminal } from "react-icons/vsc";
import AnsiToHtml from 'ansi-to-html';

const QueueStatus = () => {
    const conversorAnsi = new AnsiToHtml();
    const [aberto, definirAberto] = useState(false);
    const [comandos, definirComandos] = useState<Command[]>([]);
    const [expandidos, definirExpandidos] = useState<Record<number, boolean>>({});
    const api = useApi();
    const { projeto } = useContext(StoreContext);
    const intervalo = useRef<NodeJS.Timeout>(null);

    const idProjeto = projeto?.get()?.id;

    const carregarComandos = async () => {
        if (!idProjeto) return;
        try {
            const dados = await api.queue.getCommands(idProjeto);
            definirComandos(dados);
            intervalo.current && clearTimeout(intervalo.current);
            intervalo.current = setTimeout(carregarComandos, 30000);
        } catch (erro) {
            console.error("Failed to fetch commands", erro);
        }
    };

    useEffect(() => {
        carregarComandos();
        return () => {
            intervalo.current && clearTimeout(intervalo.current);
        }
    }, [idProjeto]);

    const cancelarComando = async (id: number) => {
        try {
            await api.queue.cancelCommand(id);
            carregarComandos();
        } catch (erro) {
            console.error("Failed to cancel command", erro);
        }
    };

    const abrirPainel = () => definirAberto(true);
    const fecharPainel = () => definirAberto(false);

    const comandosExecutando = comandos?.filter(comando => comando.status === 'RUNNING');
    const comandosPendentes = comandos?.filter(comando => comando.status === 'PENDING');
    const comandosHistorico = comandos?.filter(comando => comando.status === 'COMPLETED' || comando.status === 'FAILED');

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

    const itens = [
        {
            key: '1',
            label: `Executando (${comandosExecutando.length})`,
            children: renderizarTerminais(comandosExecutando, false),
        },
        {
            key: '2',
            label: `Aguardando (${comandosPendentes.length})`,
            children: renderizarTerminais(comandosPendentes, true),
        },
        {
            key: '3',
            label: 'Histórico',
            children: renderizarTerminais(comandosHistorico, false),
        },
    ];

    const totalPendentes = comandosExecutando.length + comandosPendentes.length;

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
