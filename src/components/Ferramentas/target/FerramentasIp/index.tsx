import { Card, Modal, notification } from "antd";
import useApi from "@/api";
import { useContext, useState } from "react";
import StoreContext from "@/store";
import { StyledFerramentasDominio } from "../styles";

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

    const getId = () => selecaoTarget?.get()?.id ?? 0;

    return (
        <StyledFerramentasDominio>
            <Card
                title={"Nmap"}
                onClick={() => showConfirmationModal('nmap', { idIp: getId().toString() })}
            >
                <Card.Meta description={"Enumeração de portas."} />
            </Card>

            <Card
                title={"Enum4linux"}
                onClick={() => showConfirmationModal('enum4linux', { idIp: getId().toString() })}
            >
                <Card.Meta description={"Enumeração de usuários."} />
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
        </StyledFerramentasDominio>
    );
};

export default FerramentasIp;