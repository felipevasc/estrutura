import { Card, notification } from "antd";
import useApi from "@/api";
import { useContext, useState } from "react";
import StoreContext from "@/store";
import { StyledToolsGrid } from "../styles";
import { FileSearchOutlined, FolderOpenOutlined, SearchOutlined } from "@ant-design/icons";
import ModalConfiguracaoFerramenta, { CampoConfiguracao } from "../ModalConfiguracaoFerramenta";

type EstadoModal = {
    comando: string;
    titulo: string;
    argsBase: Record<string, unknown>;
    campos: CampoConfiguracao[];
    valores: Record<string, unknown>;
};

const FerramentasDiretorio = () => {
    const api = useApi();
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const [modal, definirModal] = useState<EstadoModal | null>(null);

    const abrirModal = (configuracao: EstadoModal) => definirModal(configuracao);

    const alterarValor = (chave: string, valor: unknown) => {
        definirModal((atual) => atual ? { ...atual, valores: { ...atual.valores, [chave]: valor } } : null);
    };

    const executar = async () => {
        if (modal && selecaoTarget?.get()?.tipo === "diretorio") {
            const projetoAtual = projeto?.get();
            if (!projetoAtual) {
                notification.error({
                    message: "Erro ao adicionar comando",
                    description: "Nenhum projeto selecionado.",
                    placement: "bottomRight",
                });
                definirModal(null);
                return;
            }
            try {
                await api.queue.addCommand(modal.comando, { ...modal.argsBase, ...modal.valores }, projetoAtual.id);
                notification.success({
                    message: "Comando adicionado à fila",
                    description: `O comando "${modal.comando}" foi adicionado à fila de execução.`,
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
        definirModal(null);
    };

    const idDiretorio = () => selecaoTarget?.get()?.id?.toString() ?? "0";

    const valoresExtensoes = ".php,.html,.txt,.js,.bak,.zip,.conf";
    const wordlistPadrao = "/usr/share/wordlists/dirb/common.txt";

    const valoresWhatweb = {
        timeout: 60,
        agressividade: "1",
        userAgent: "",
        autenticacao: "",
    };

    const modalFfuf = (tipoFuzz?: string) => abrirModal({
        comando: "ffuf",
        titulo: tipoFuzz === "arquivo" ? "Configurar Ffuf Arquivos" : "Configurar Ffuf",
        argsBase: tipoFuzz ? { idDiretorio: idDiretorio(), tipoFuzz } : { idDiretorio: idDiretorio() },
        campos: [
            { chave: "wordlist", rotulo: "Wordlist", tipo: "texto" },
            { chave: "extensoes", rotulo: "Extensões", tipo: "texto" }
        ],
        valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes }
    });

    const modalGobuster = (tipoFuzz?: string) => abrirModal({
        comando: "gobuster",
        titulo: tipoFuzz === "arquivo" ? "Configurar Gobuster Arquivos" : "Configurar Gobuster",
        argsBase: tipoFuzz ? { idDiretorio: idDiretorio(), tipoFuzz } : { idDiretorio: idDiretorio() },
        campos: [
            { chave: "wordlist", rotulo: "Wordlist", tipo: "texto" },
            { chave: "extensoes", rotulo: "Extensões", tipo: "texto" }
        ],
        valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes }
    });

    const modalWhatweb = () => abrirModal({
        comando: "whatweb",
        titulo: "Configurar WhatWeb",
        argsBase: { idDiretorio: idDiretorio() },
        campos: [
            { chave: "timeout", rotulo: "Timeout (segundos)", tipo: "numero" },
            { chave: "agressividade", rotulo: "Agressividade", tipo: "texto" },
            { chave: "userAgent", rotulo: "User Agent", tipo: "texto" },
            { chave: "autenticacao", rotulo: "Autenticação", tipo: "texto" }
        ],
        valores: valoresWhatweb
    });

    return (
        <StyledToolsGrid>
            <Card className="interactive" onClick={() => modalFfuf()}>
                <div className="tool-icon">
                    <FileSearchOutlined />
                </div>
                <Card.Meta
                    title="Ffuf"
                    description="Fuzzing de diretórios."
                />
            </Card>

            <Card className="interactive" onClick={() => modalFfuf("arquivo")}>
                <div className="tool-icon">
                    <FileSearchOutlined />
                </div>
                <Card.Meta
                    title="Ffuf Arquivos"
                    description="Fuzzing de arquivos."
                />
            </Card>

            <Card className="interactive" onClick={() => modalGobuster()}>
                <div className="tool-icon">
                    <FolderOpenOutlined />
                </div>
                <Card.Meta
                    title="Gobuster"
                    description="Descoberta de diretórios."
                />
            </Card>

            <Card className="interactive" onClick={() => modalGobuster("arquivo")}>
                <div className="tool-icon">
                    <FolderOpenOutlined />
                </div>
                <Card.Meta
                    title="Gobuster Arquivos"
                    description="Descoberta de arquivos."
                />
            </Card>

            <Card className="interactive" onClick={modalWhatweb}>
                <div className="tool-icon">
                    <SearchOutlined />
                </div>
                <Card.Meta
                    title="WhatWeb"
                    description="Fingerprint do caminho."
                />
            </Card>

            <ModalConfiguracaoFerramenta
                aberto={!!modal}
                titulo={modal?.titulo ?? ""}
                campos={modal?.campos ?? []}
                valores={modal?.valores ?? {}}
                aoAlterar={alterarValor}
                aoCancelar={() => definirModal(null)}
                aoConfirmar={executar}
            />
        </StyledToolsGrid>
    );
};

export default FerramentasDiretorio;
