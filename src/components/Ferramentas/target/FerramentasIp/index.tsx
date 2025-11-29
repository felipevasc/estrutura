import { Card, Modal, notification } from "antd";
import useApi from "@/api";
import { useContext, useState } from "react";
import StoreContext from "@/store";
import { StyledToolsGrid } from "../styles";
import {
    RadarChartOutlined,
    UserSwitchOutlined,
    FileSearchOutlined,
    ThunderboltOutlined,
    FolderOpenOutlined,
    SearchOutlined
} from "@ant-design/icons";

const FerramentasIp = () => {
    const api = useApi();
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [commandToRun, setCommandToRun] = useState<{ command: string, args: Record<string, unknown> } | null>(null);

    const showConfirmationModal = (command: string, args: Record<string, unknown>) => {
        setCommandToRun({ command, args });
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        if (commandToRun && selecaoTarget?.get()?.tipo === "ip") {
            try {
                const currentProject = projeto?.get();
                if (!currentProject) {
                    notification.error({
                        message: 'Erro ao adicionar comando',
                        description: 'Nenhum projeto selecionado.',
                        placement: 'bottomRight',
                    });
                    setIsModalVisible(false);
                    setCommandToRun(null);
                    return;
                }
                await api.queue.addCommand(commandToRun.command, commandToRun.args, currentProject.id);
                notification.success({
                    message: 'Comando adicionado à fila',
                    description: `O comando "${commandToRun.command}" foi adicionado à fila de execução.`,
                    placement: 'bottomRight',
                });
            } catch {
                notification.error({
                    message: 'Erro ao adicionar comando',
                    description: 'Ocorreu um erro ao tentar adicionar o comando à fila.',
                    placement: 'bottomRight',
                });
            }
        }
        setIsModalVisible(false);
        setCommandToRun(null);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setCommandToRun(null);
    };

    const getId = () => selecaoTarget?.get()?.id ?? 0;

    return (
        <StyledToolsGrid>
            <Card
                className="interactive"
                onClick={() => showConfirmationModal('nmap', { idIp: getId().toString() })}
            >
                <div className="tool-icon">
                    <RadarChartOutlined />
                </div>
                <Card.Meta
                    title="Nmap"
                    description="Enumeração de portas."
                />
            </Card>

            <Card
                className="interactive"
                onClick={() => showConfirmationModal('rustscan', { idIp: getId().toString() })}
            >
                <div className="tool-icon">
                    <ThunderboltOutlined />
                </div>
                <Card.Meta
                    title="Rustscan"
                    description="Scan rápido de portas."
                />
            </Card>

            <Card
                className="interactive"
                onClick={() => showConfirmationModal('whatweb', { idIp: getId().toString() })}
            >
                <div className="tool-icon">
                    <SearchOutlined />
                </div>
                <Card.Meta
                    title="WhatWeb"
                    description="Fingerprint do host."
                />
            </Card>

            <Card
                className="interactive"
                onClick={() => showConfirmationModal('enum4linux', { idIp: getId().toString() })}
            >
                <div className="tool-icon">
                    <UserSwitchOutlined />
                </div>
                <Card.Meta
                    title="Enum4linux"
                    description="Enumeração de usuários SMB."
                />
            </Card>

            <Card
                className="interactive"
                onClick={() => showConfirmationModal('ffuf', { idIp: getId().toString() })}
            >
                <div className="tool-icon">
                    <FileSearchOutlined />
                </div>
                <Card.Meta
                    title="Ffuf"
                    description="Fuzzing de diretórios."
                />
            </Card>

            <Card
                className="interactive"
                onClick={() => showConfirmationModal('ffuf', { idIp: getId().toString(), tipoFuzz: 'arquivo' })}
            >
                <div className="tool-icon">
                    <FileSearchOutlined />
                </div>
                <Card.Meta
                    title="Ffuf Arquivos"
                    description="Fuzzing de arquivos."
                />
            </Card>

            <Card
                className="interactive"
                onClick={() => showConfirmationModal('gobuster', { idIp: getId().toString() })}
            >
                <div className="tool-icon">
                    <FolderOpenOutlined />
                </div>
                <Card.Meta
                    title="Gobuster"
                    description="Descoberta de diretórios."
                />
            </Card>

            <Card
                className="interactive"
                onClick={() => showConfirmationModal('gobuster', { idIp: getId().toString(), tipoFuzz: 'arquivo' })}
            >
                <div className="tool-icon">
                    <FolderOpenOutlined />
                </div>
                <Card.Meta
                    title="Gobuster Arquivos"
                    description="Descoberta de arquivos."
                />
            </Card>

            <Modal
                title="Confirmar Execução"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Executar"
                cancelText="Cancelar"
            >
                <p>Tem certeza que deseja executar o comando &quot;{commandToRun?.command}&quot;?</p>
            </Modal>
        </StyledToolsGrid>
    );
};

export default FerramentasIp;
