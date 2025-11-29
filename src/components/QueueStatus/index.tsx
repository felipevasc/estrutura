import { Drawer, Button, Tabs, List, Tag, Popconfirm } from 'antd';
import { UnorderedListOutlined, DeleteOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useApi from '@/api';
import { Command, CommandStatus } from '@prisma/client';
import { StyledQueueStatus } from './styles';
import StoreContext from '@/store';
import { VscTerminal } from "react-icons/vsc";

const QueueStatus = () => {
    const [aberto, setAberto] = useState(false);
    const [comandos, setComandos] = useState<Command[]>([]);
    const api = useApi();
    const { projeto } = useContext(StoreContext);
    const agendamento = useRef<NodeJS.Timeout | null>(null);

    const idProjeto = projeto?.get()?.id;

    const limparAgendamento = useCallback(() => {
        if (agendamento.current) {
            clearTimeout(agendamento.current);
            agendamento.current = null;
        }
    }, []);

    const buscarComandos = useCallback(async () => {
        if (!idProjeto) return;
        try {
            const dados = await api.queue.getCommands(idProjeto);
            setComandos(dados);
            limparAgendamento();
            agendamento.current = setTimeout(buscarComandos, 30000);
        } catch (erro) {
            console.error("Falha ao buscar comandos", erro);
        }
    }, [idProjeto, api.queue, limparAgendamento]);

    useEffect(() => {
        buscarComandos();
        return () => {
            limparAgendamento();
        }
    }, [buscarComandos, limparAgendamento]);

    const cancelarComando = useCallback(async (idComando: number) => {
        try {
            await api.queue.cancelCommand(idComando);
            buscarComandos();
        } catch (erro) {
            console.error("Falha ao cancelar comando", erro);
        }
    }, [api.queue, buscarComandos]);

    const abrirPainel = () => setAberto(true);
    const fecharPainel = () => setAberto(false);

    const comandosEmExecucao = useMemo(() => comandos?.filter(c => c.status === 'RUNNING'), [comandos]);
    const comandosPendentes = useMemo(() => comandos?.filter(c => c.status === 'PENDING'), [comandos]);
    const historicoComandos = useMemo(() => comandos?.filter(c => c.status === 'COMPLETED' || c.status === 'FAILED'), [comandos]);

    const gerarEtiquetaStatus = (status: CommandStatus) => {
        if (status === 'RUNNING') return <Tag icon={<LoadingOutlined spin />} color="processing">Executando</Tag>;
        if (status === 'PENDING') return <Tag color="warning">Aguardando</Tag>;
        if (status === 'COMPLETED') return <Tag icon={<CheckCircleOutlined />} color="success">Concluído</Tag>;
        if (status === 'FAILED') return <Tag icon={<CloseCircleOutlined />} color="error">Falhou</Tag>;
        return <Tag>Desconhecido</Tag>;
    };

    const renderizarLista = (dados: Command[], permitirCancelamento: boolean) => (
        <List
            itemLayout="horizontal"
            dataSource={dados}
            renderItem={item => (
                <List.Item
                    key={item.id}
                    actions={permitirCancelamento ? [
                        <Popconfirm
                            key="cancelar"
                            title="Cancelar comando?"
                            onConfirm={() => cancelarComando(item.id)}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button icon={<DeleteOutlined />} type="primary" danger shape="circle" />
                        </Popconfirm>
                    ] : []}
                >
                    <List.Item.Meta
                        avatar={<VscTerminal />}
                        title={item.command}
                        description={gerarEtiquetaStatus(item.status)}
                    />
                </List.Item>
            )}
        />
    );

    const renderizarHistorico = (dados: Command[], permitirCancelamento: boolean) => (
        <List
            itemLayout="horizontal"
            dataSource={dados}
            renderItem={item => (
                <List.Item
                    key={item.id}
                    style={{display: "flex", flexDirection: "column"}}
                    actions={permitirCancelamento ? [
                        <Popconfirm
                            key="cancelar"
                            title="Cancelar comando?"
                            onConfirm={() => cancelarComando(item.id)}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button icon={<DeleteOutlined />} type="primary" danger shape="circle" />
                        </Popconfirm>
                    ] : []}
                >
                    <List.Item.Meta
                        style={{width: "100%"}}
                        avatar={<VscTerminal />}
                        title={item.executedCommand || item.command}
                        description={gerarEtiquetaStatus(item.status)}
                    />
                    {(item.rawOutput || item.output) && (
                        <pre style={{
                            backgroundColor: '#1e1e1e',
                            color: '#d4d4d4',
                            padding: '15px',
                            borderRadius: '5px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            width: '100%',
                            fontFamily: 'monospace'
                        }}>
                            {item.executedCommand && <div style={{ color: '#569cd6' }}>$ {item.executedCommand}</div>}
                            {item.rawOutput || item.output}
                        </pre>
                    )}
                </List.Item>
            )}
        />
    );

    const secoes = [
        {
            key: '1',
            label: `Executando (${comandosEmExecucao.length})`,
            children: renderizarLista(comandosEmExecucao, false),
        },
        {
            key: '2',
            label: `Aguardando (${comandosPendentes.length})`,
            children: renderizarLista(comandosPendentes, true),
        },
        {
            key: '3',
            label: 'Histórico',
            children: renderizarHistorico(historicoComandos, false),
        },
    ];

    const pendentes = comandosEmExecucao.length + comandosPendentes.length;

    return (
        <StyledQueueStatus>
            <Button
                type="primary"
                icon={<UnorderedListOutlined />}
                onClick={abrirPainel}
                size="large"
            >
                Fila de Execução ({pendentes})
            </Button>
            <Drawer title="Fila de Execução" placement="right" onClose={fecharPainel} open={aberto} width={800}>
                <Tabs defaultActiveKey="1" items={secoes} />
            </Drawer>
        </StyledQueueStatus>
    );
};

export default QueueStatus;
