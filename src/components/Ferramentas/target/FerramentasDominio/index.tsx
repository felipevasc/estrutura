import { Card, Modal, notification } from "antd";
import { StyledToolsGrid } from "../styles";
import useApi from "@/api";
import { useContext, useState } from "react";
import StoreContext from "@/store";
import {
    DeploymentUnitOutlined,
    NodeIndexOutlined,
    SearchOutlined,
    AimOutlined,
    FileSearchOutlined,
    FolderOpenOutlined
} from "@ant-design/icons";

const FerramentasDominio = () => {
    const api = useApi();
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [commandToRun, setCommandToRun] = useState<{ command: string, args: Record<string, unknown> } | null>(null);

    const showConfirmationModal = (command: string, args: Record<string, unknown>) => {
        setCommandToRun({ command, args });
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        if (commandToRun && selecaoTarget?.get()?.tipo === "domain") {
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

    const getDomainId = () => selecaoTarget?.get()?.id ?? 0;

    return (
        <StyledToolsGrid>
            <Card
                className="interactive"
                onClick={() => showConfirmationModal('amass', { idDominio: getDomainId().toString() })}
            >
                <div className="tool-icon">
                    <DeploymentUnitOutlined />
                </div>
                <Card.Meta
                    title="Amass"
                    description="Enumeração de subdomínios e descoberta de assets."
                />
            </Card>

            <Card
                className="interactive"
                onClick={() => showConfirmationModal('subfinder', { idDominio: getDomainId().toString() })}
            >
                <div className="tool-icon">
                    <NodeIndexOutlined />
                </div>
                <Card.Meta
                    title="Subfinder"
                    description="Descoberta de subdomínios passivos."
                />
            </Card>

            <Card
            >
                <div className="tool-icon">
                    <AimOutlined />
                </div>
                <Card.Meta
                    title="Findomain"
                    description="Monitoramento e descoberta de subdomínios."
                />
            </Card>

            <Card
                className="interactive"
                onClick={() => showConfirmationModal('nslookup', { idDominio: getDomainId().toString() })}
            >
                <div className="tool-icon">
                    <SearchOutlined />
                </div>
                <Card.Meta
                    title="NsLookup"
                    description="Descobrir IPs de um domínio."
                />
            </Card>

            <Card
                className="interactive"
                onClick={() => showConfirmationModal('ffuf', { idDominio: getDomainId().toString() })}
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
                onClick={() => showConfirmationModal('ffuf', { idDominio: getDomainId().toString(), tipoFuzz: 'arquivo' })}
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
                onClick={() => showConfirmationModal('gobuster', { idDominio: getDomainId().toString() })}
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
                onClick={() => showConfirmationModal('gobuster', { idDominio: getDomainId().toString(), tipoFuzz: 'arquivo' })}
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

export default FerramentasDominio;
