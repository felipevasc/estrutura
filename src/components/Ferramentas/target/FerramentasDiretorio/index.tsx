import { Card, Modal, notification } from "antd";
import useApi from "@/api";
import { useContext, useState } from "react";
import StoreContext from "@/store";
import { StyledToolsGrid } from "../styles";
import { FileSearchOutlined, FolderOpenOutlined, SearchOutlined } from "@ant-design/icons";

const FerramentasDiretorio = () => {
    const api = useApi();
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const [modalVisivel, definirModalVisivel] = useState(false);
    const [acaoPendente, definirAcaoPendente] = useState<{ comando: string, args: Record<string, unknown> } | null>(null);

    const abrirModal = (comando: string, args: Record<string, unknown>) => {
        definirAcaoPendente({ comando, args });
        definirModalVisivel(true);
    };

    const executar = async () => {
        if (acaoPendente && selecaoTarget?.get()?.tipo === "diretorio") {
            const projetoAtual = projeto?.get();
            if (!projetoAtual) {
                notification.error({
                    message: "Erro ao adicionar comando",
                    description: "Nenhum projeto selecionado.",
                    placement: "bottomRight",
                });
                limpar();
                return;
            }

            try {
                await api.queue.addCommand(acaoPendente.comando, acaoPendente.args, projetoAtual.id);
                notification.success({
                    message: "Comando adicionado à fila",
                    description: `O comando "${acaoPendente.comando}" foi adicionado à fila de execução.`,
                    placement: "bottomRight",
                });
            } catch {
                notification.error({
                    message: "Erro ao adicionar comando",
                    description: "Ocorreu um erro ao tentar adicionar o comando à fila.",
                    placement: "bottomRight",
                });
            }
        }
        limpar();
    };

    const limpar = () => {
        definirModalVisivel(false);
        definirAcaoPendente(null);
    };

    const idAtual = () => selecaoTarget?.get()?.id ?? 0;

    return (
        <StyledToolsGrid>
            <Card
                className="interactive"
                onClick={() => abrirModal('ffuf', { idDiretorio: idAtual().toString() })}
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
                onClick={() => abrirModal('ffuf', { idDiretorio: idAtual().toString(), tipoFuzz: 'arquivo' })}
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
                onClick={() => abrirModal('gobuster', { idDiretorio: idAtual().toString() })}
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
                onClick={() => abrirModal('gobuster', { idDiretorio: idAtual().toString(), tipoFuzz: 'arquivo' })}
            >
                <div className="tool-icon">
                    <FolderOpenOutlined />
                </div>
                <Card.Meta
                    title="Gobuster Arquivos"
                    description="Descoberta de arquivos."
                />
            </Card>

            <Card
                className="interactive"
                onClick={() => abrirModal('whatweb', { idDiretorio: idAtual().toString() })}
            >
                <div className="tool-icon">
                    <SearchOutlined />
                </div>
                <Card.Meta
                    title="WhatWeb"
                    description="Fingerprint do caminho."
                />
            </Card>

            <Modal
                title="Confirmar Execução"
                open={modalVisivel}
                onOk={executar}
                onCancel={limpar}
                okText="Executar"
                cancelText="Cancelar"
            >
                <p>Tem certeza que deseja executar o comando "{acaoPendente?.comando}"?</p>
            </Modal>
        </StyledToolsGrid>
    );
};

export default FerramentasDiretorio;
