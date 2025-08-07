import { Card, Modal, notification } from "antd";
import useApi from "@/api";
import { useContext, useState } from "react";
import StoreContext from "@/store";
import { StyledFerramentasIp } from "./styles";

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

    const tools = [
        { key: 'nmap-sv', title: 'Nmap - Scan de Serviço', description: 'Scan de portas abertas e versões de serviços.' },
        { key: 'nmap-vuln', title: 'Nmap - Scan de Vulns', description: 'Executa scripts de vulnerabilidade do Nmap.' },
        { key: 'whois', title: 'Whois', description: 'Obtém informações de registro do IP.' },
        { key: 'dig-rev', title: 'DNS Reverso', description: 'Tenta resolver o nome de host reverso do IP.' },
        { key: 'traceroute', title: 'Traceroute', description: 'Traça a rota de pacotes até o IP de destino.' },
        { key: 'nikto', title: 'Nikto', description: 'Scanner de vulnerabilidades para servidores web.' },
        { key: 'gobuster', title: 'Gobuster', description: 'Bruteforce de diretórios e arquivos em servidores web.' },
        { key: 'enum4linux-ng', title: 'Enum4linux-ng', description: 'Enumera informações de sistemas SMB/Windows.' },
        { key: 'sslscan', title: 'SSLScan', description: 'Analisa cifras e protocolos SSL/TLS.' },
        { key: 'searchsploit', title: 'Searchsploit', description: 'Busca por exploits públicos para os serviços encontrados.' },
    ];

    return (
        <StyledFerramentasIp>
            {tools.map(tool => (
                <Card
                    key={tool.key}
                    title={tool.title}
                    hoverable
                    onClick={() => showConfirmationModal(tool.key, { idIp: getIpId().toString() })}
                >
                    <Card.Meta description={tool.description} />
                </Card>
            ))}

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
