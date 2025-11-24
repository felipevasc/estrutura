import { useContext, useState } from "react";
import StoreContext from "@/store";
import { InspectorBody, ActionItem } from "./styles";
import { Empty, Modal, notification } from "antd";
import useApi from "@/api";
import { DeploymentUnitOutlined, NodeIndexOutlined, SearchOutlined, FileSearchOutlined, RadarChartOutlined, UserSwitchOutlined } from "@ant-design/icons";

const InspectorActions = () => {
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const target = selecaoTarget?.get();
    const api = useApi();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [commandToRun, setCommandToRun] = useState<{ command: string, args: Record<string, unknown> } | null>(null);

    if (!target) {
         return (
            <InspectorBody>
                <Empty description="Selecione um item para ver ações" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </InspectorBody>
        );
    }

    const showConfirmationModal = (command: string, args: Record<string, unknown>) => {
        setCommandToRun({ command, args });
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        const currentProject = projeto?.get();
        if (commandToRun && currentProject) {
            try {
                await api.queue.addCommand(commandToRun.command, commandToRun.args, currentProject.id);
                notification.success({
                    message: 'Comando iniciado',
                    description: `${commandToRun.command} adicionado à fila.`,
                    placement: 'bottomRight',
                });
            } catch {
                notification.error({
                    message: 'Erro',
                    description: 'Falha ao iniciar comando.',
                    placement: 'bottomRight',
                });
            }
        }
        setIsModalVisible(false);
        setCommandToRun(null);
    };

    const renderDomainActions = () => (
        <>
            <ActionItem onClick={() => showConfirmationModal('amass', { idDominio: target.id.toString() })}>
                <div className="info">
                    <strong>Amass</strong>
                    <span>Enumeração de assets</span>
                </div>
                <DeploymentUnitOutlined />
            </ActionItem>
            <ActionItem onClick={() => showConfirmationModal('subfinder', { idDominio: target.id.toString() })}>
                <div className="info">
                    <strong>Subfinder</strong>
                    <span>Subdomínios passivos</span>
                </div>
                <NodeIndexOutlined />
            </ActionItem>
            <ActionItem onClick={() => showConfirmationModal('nslookup', { idDominio: target.id.toString() })}>
                <div className="info">
                    <strong>NsLookup</strong>
                    <span>Resolução de IPs</span>
                </div>
                <SearchOutlined />
            </ActionItem>
            <ActionItem onClick={() => showConfirmationModal('ffuf', { idDominio: target.id.toString() })}>
                <div className="info">
                    <strong>Ffuf</strong>
                    <span>Fuzzing de diretórios</span>
                </div>
                <FileSearchOutlined />
            </ActionItem>
        </>
    );

    const renderIpActions = () => (
        <>
            <ActionItem onClick={() => showConfirmationModal('nmap', { idIp: target.id.toString() })}>
                <div className="info">
                    <strong>Nmap</strong>
                    <span>Scan de portas</span>
                </div>
                <RadarChartOutlined />
            </ActionItem>
             <ActionItem onClick={() => showConfirmationModal('enum4linux', { idIp: target.id.toString() })}>
                <div className="info">
                    <strong>Enum4Linux</strong>
                    <span>Enumeração SMB</span>
                </div>
                <UserSwitchOutlined />
            </ActionItem>
            <ActionItem onClick={() => showConfirmationModal('ffuf', { idIp: target.id.toString() })}>
                <div className="info">
                    <strong>Ffuf</strong>
                    <span>Fuzzing de diretórios</span>
                </div>
                <FileSearchOutlined />
            </ActionItem>
        </>
    );

    return (
        <InspectorBody>
            {target.tipo === 'domain' && renderDomainActions()}
            {target.tipo === 'ip' && renderIpActions()}
            {/* Fallback or other types */}
            {target.tipo !== 'domain' && target.tipo !== 'ip' && <Empty description="Sem ações disponíveis" image={Empty.PRESENTED_IMAGE_SIMPLE} />}

            <Modal
                title="Confirmar Execução"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Executar"
                cancelText="Cancelar"
            >
                <p>Executar <strong>{commandToRun?.command}</strong> neste alvo?</p>
            </Modal>
        </InspectorBody>
    );
}

export default InspectorActions;
