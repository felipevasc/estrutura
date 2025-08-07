import { Badge, Drawer, Button, Tabs, List, Tag, Popconfirm, Collapse } from 'antd';
import { UnorderedListOutlined, DeleteOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import useApi from '@/api';
import { Command, CommandStatus } from '@prisma/client';
import { StyledQueueStatus } from './styles';
import StoreContext from '@/store';
import { VscTerminal } from "react-icons/vsc";
const { Panel } = Collapse;

const QueueStatus = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [commands, setCommands] = useState<Command[]>([]);
    const api = useApi();
    const { projeto } = useContext(StoreContext);

    const projectId = projeto?.get()?.id;

    const fetchCommands = async () => {
        if (!projectId) return;
        try {
            const data = await api.queue.getCommands(projectId);
            setCommands(data);
        } catch (error) {
            console.error("Failed to fetch commands", error);
        }
    };

    useEffect(() => {
        fetchCommands();
        const interval = setInterval(fetchCommands, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [projectId]);

    const handleCancelCommand = async (commandId: number) => {
        try {
            await api.queue.cancelCommand(commandId);
            fetchCommands(); // Refresh the list
        } catch (error) {
            console.error("Failed to cancel command", error);
        }
    };

    const showDrawer = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const runningCommands = commands.filter(c => c.status === 'RUNNING');
    const pendingCommands = commands.filter(c => c.status === 'PENDING');
    const historyCommands = commands.filter(c => c.status === 'COMPLETED' || c.status === 'FAILED');

    const getStatusTag = (status: CommandStatus) => {
        switch (status) {
            case 'RUNNING': return <Tag icon={<LoadingOutlined spin />} color="processing">Executando</Tag>;
            case 'PENDING': return <Tag color="warning">Aguardando</Tag>;
            case 'COMPLETED': return <Tag icon={<CheckCircleOutlined />} color="success">Concluído</Tag>;
            case 'FAILED': return <Tag icon={<CloseCircleOutlined />} color="error">Falhou</Tag>;
            default: return <Tag>Desconhecido</Tag>;
        }
    };

    const renderCommandList = (data: Command[], showCancel: boolean) => (
        <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={item => (
                <List.Item
                    actions={showCancel ? [
                        <Popconfirm
                            title="Cancelar comando?"
                            onConfirm={() => handleCancelCommand(item.id)}
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
                        description={getStatusTag(item.status)}
                    />
                     {item.output && (
                        <Collapse ghost style={{width: "100%"}}>
                            <Panel header="Ver saída" key={item.id} >
                                <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                                    {item.output}
                                </pre>
                            </Panel>
                        </Collapse>
                    )}
                </List.Item>
            )}
        />
    );

    const items = [
        {
            key: '1',
            label: `Executando (${runningCommands.length})`,
            children: renderCommandList(runningCommands, false),
        },
        {
            key: '2',
            label: `Aguardando (${pendingCommands.length})`,
            children: renderCommandList(pendingCommands, true),
        },
        {
            key: '3',
            label: 'Histórico',
            children: renderCommandList(historyCommands, false),
        },
    ];

    const pendingCount = runningCommands.length + pendingCommands.length;

    return (
        <StyledQueueStatus>
            <Badge count={pendingCount} onClick={showDrawer} title="Fila de execução">
                <VscTerminal style={{ fontSize: '30px', cursor: 'pointer' }} />
            </Badge>
            <Drawer title="Fila de Execução" placement="right" onClose={onClose} open={isOpen} width={500}>
                <Tabs defaultActiveKey="1" items={items} />
            </Drawer>
        </StyledQueueStatus>
    );
};

export default QueueStatus;
