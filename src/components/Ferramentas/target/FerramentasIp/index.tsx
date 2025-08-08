import { Card, Modal, notification } from "antd";
import { StyledFerramentasIp } from "./styles";
import useApi from "@/api";
import { useContext, useState } from "react";
import StoreContext from "@/store";

const FerramentasIp = () => {
    const api = useApi();
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [commandToRun, setCommandToRun] = useState<{ command: string, args: any } | null>(null);

    const showConfirmationModal = (command: string, args: any) => {
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
            } catch (error) {
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

    const getIpId = () => selecaoTarget?.get()?.id ?? 0;

    return (
        <StyledFerramentasIp>
            <Card
                title={"Nmap -Pn"}
                onClick={() => showConfirmationModal('nmap', { idIp: getIpId().toString() })}
            >
                <Card.Meta description={"Varredura de portas com Nmap."} />
            </Card>

            <Modal
                title="Confirmar Execução"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Executar"
                cancelText="Cancelar"
            >
                <p>Tem certeza que deseja executar o comando "{commandToRun?.command}"?</p>
            </Modal>
        </StyledFerramentasIp>
    );
};

export default FerramentasIp;
