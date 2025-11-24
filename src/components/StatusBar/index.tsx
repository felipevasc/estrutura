import { StyledStatusBar, StatusItem } from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTerminal, faCircleNotch, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import StoreContext from "@/store";
import useApi from "@/api";
import { Command } from "@prisma/client";
import { Drawer, Tabs, List, Tag, Popconfirm, Button } from "antd";
import { DeleteOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { VscTerminal } from "react-icons/vsc";

const StatusBar = () => {
    const [commands, setCommands] = useState<Command[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { projeto } = useContext(StoreContext);
    const api = useApi();
    const timeout = useRef<NodeJS.Timeout>(null);

    const projectId = projeto?.get()?.id;

    const fetchCommands = useCallback(async () => {
        if (!projectId) return;
        try {
            const data = await api.queue.getCommands(projectId);
            setCommands(data);
            timeout.current && clearTimeout(timeout.current);
            timeout.current = setTimeout(fetchCommands, 5000); // Polling faster for status bar
        } catch (error) {
            console.error("Failed to fetch commands", error);
        }
    }, [projectId, api.queue]);

    useEffect(() => {
        fetchCommands();
        return () => {
            timeout.current && clearTimeout(timeout.current);
        }
    }, [fetchCommands]);

    const runningCommands = commands.filter(c => c.status === 'RUNNING');
    const failedCommands = commands.filter(c => c.status === 'FAILED');

    // Status Bar Logic
    const isRunning = runningCommands.length > 0;
    const hasFailures = failedCommands.length > 0;

    let statusText = "Pronto";
    let statusIcon = faCheckCircle;
    let statusColor = "inherit"; // default white from CSS

    if (isRunning) {
        statusText = `Executando ${runningCommands[0].command}... (${runningCommands.length} em fila)`;
        statusIcon = faCircleNotch;
        // Animation would be nice here
    } else if (hasFailures) {
        statusText = "Alguns comandos falharam";
        statusIcon = faExclamationTriangle;
        statusColor = "#ffccc7";
    }

    // --- Drawer Logic (Reusing QueueStatus) ---
     const handleCancelCommand = async (commandId: number) => {
        try {
            await api.queue.cancelCommand(commandId);
            fetchCommands();
        } catch (error) {
            console.error("Failed to cancel command", error);
        }
    };

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'RUNNING': return <Tag icon={<LoadingOutlined spin />} color="processing">Executando</Tag>;
            case 'PENDING': return <Tag color="warning">Aguardando</Tag>;
            case 'COMPLETED': return <Tag icon={<CheckCircleOutlined />} color="success">Concluído</Tag>;
            case 'FAILED': return <Tag icon={<CloseCircleOutlined />} color="error">Falhou</Tag>;
            default: return <Tag>Desconhecido</Tag>;
        }
    };

    // Reuse renderCommandList logic... simplified for brevity
     const renderList = (data: Command[], showCancel: boolean) => (
        <List
            dataSource={data}
            renderItem={item => (
                <List.Item
                     actions={showCancel ? [
                        <Popconfirm
                            key="delete"
                            title="Cancelar?"
                            onConfirm={() => handleCancelCommand(item.id)}
                        >
                            <Button icon={<DeleteOutlined />} size="small" danger type="text" />
                        </Popconfirm>
                    ] : []}
                >
                    <List.Item.Meta
                        avatar={<VscTerminal />}
                        title={item.command}
                        description={getStatusTag(item.status)}
                    />
                     {(item.status === 'FAILED' || item.status === 'COMPLETED') && (
                        <div style={{fontSize: '0.8em', color: '#888'}}>
                           {/* Click to see output could go here */}
                        </div>
                     )}
                </List.Item>
            )}
        />
    );

    const drawerItems = [
        {
            key: '1',
            label: `Ativos (${runningCommands.length})`,
            children: renderList(runningCommands, false),
        },
        {
            key: '2',
            label: 'Histórico',
            children: renderList(commands.filter(c => c.status !== 'RUNNING' && c.status !== 'PENDING'), false),
        }
    ];

    return (
        <>
            <StyledStatusBar>
                <StatusItem style={{ color: statusColor }}>
                    <FontAwesomeIcon icon={statusIcon} spin={isRunning} /> {statusText}
                </StatusItem>

                <div style={{ flex: 1 }}></div>

                <StatusItem style={{ cursor: 'pointer' }} onClick={() => setIsDrawerOpen(true)}>
                    <FontAwesomeIcon icon={faTerminal} /> Output / Fila
                </StatusItem>
            </StyledStatusBar>

            <Drawer
                title="Console de Execução"
                placement="bottom"
                height={400}
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
            >
                 <Tabs defaultActiveKey="1" items={drawerItems} />
            </Drawer>
        </>
    );
};

export default StatusBar;
