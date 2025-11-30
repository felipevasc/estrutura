import { Card, notification } from "antd";
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
import ModalConfiguracaoFerramenta, { CampoConfiguracao } from "../ModalConfiguracaoFerramenta";

type EstadoModal = {
    comando: string;
    titulo: string;
    argsBase: Record<string, unknown>;
    campos: CampoConfiguracao[];
    valores: Record<string, unknown>;
};

const FerramentasIp = () => {
    const api = useApi();
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const [modal, definirModal] = useState<EstadoModal | null>(null);

    const abrirModal = (configuracao: EstadoModal) => definirModal(configuracao);

    const alterarValor = (chave: string, valor: unknown) => {
        definirModal((atual) => atual ? { ...atual, valores: { ...atual.valores, [chave]: valor } } : null);
    };

    const executar = async () => {
        if (modal && selecaoTarget?.get()?.tipo === "ip") {
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

    const idIp = () => selecaoTarget?.get()?.id?.toString() ?? "0";

    const valoresWhatweb = {
        timeout: 60,
        agressividade: "1",
        userAgent: "",
        autenticacao: "",
    };

    const valoresExtensoes = ".php,.html,.txt,.js,.bak,.zip,.conf";
    const wordlistPadrao = "/usr/share/wordlists/dirb/common.txt";

    const modalNmap = () => abrirModal({
        comando: "nmap",
        titulo: "Configurar Nmap",
        argsBase: { idIp: idIp() },
        campos: [{ chave: "faixaPortas", rotulo: "Faixa de portas", tipo: "texto" }],
        valores: { faixaPortas: "1-9999" }
    });

    const modalRustscan = () => abrirModal({
        comando: "rustscan",
        titulo: "Configurar Rustscan",
        argsBase: { idIp: idIp() },
        campos: [{ chave: "faixaPortas", rotulo: "Faixa de portas", tipo: "texto" }],
        valores: { faixaPortas: "1-65535" }
    });

    const modalWhatweb = () => abrirModal({
        comando: "whatweb",
        titulo: "Configurar WhatWeb",
        argsBase: { idIp: idIp() },
        campos: [
            { chave: "timeout", rotulo: "Timeout (segundos)", tipo: "numero" },
            { chave: "agressividade", rotulo: "Agressividade", tipo: "texto" },
            { chave: "userAgent", rotulo: "User Agent", tipo: "texto" },
            { chave: "autenticacao", rotulo: "Autenticação", tipo: "texto" }
        ],
        valores: valoresWhatweb
    });

    const modalEnum4linux = () => abrirModal({
        comando: "enum4linux",
        titulo: "Configurar Enum4linux",
        argsBase: { idIp: idIp() },
        campos: [{ chave: "opcoes", rotulo: "Opções", tipo: "texto" }],
        valores: { opcoes: "-U -r" }
    });

    const modalFfuf = (tipoFuzz?: string) => abrirModal({
        comando: "ffuf",
        titulo: tipoFuzz === "arquivo" ? "Configurar Ffuf Arquivos" : "Configurar Ffuf",
        argsBase: tipoFuzz ? { idIp: idIp(), tipoFuzz } : { idIp: idIp() },
        campos: [
            { chave: "wordlist", rotulo: "Wordlist", tipo: "texto" },
            { chave: "extensoes", rotulo: "Extensões", tipo: "texto" }
        ],
        valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes }
    });

    const modalGobuster = (tipoFuzz?: string) => abrirModal({
        comando: "gobuster",
        titulo: tipoFuzz === "arquivo" ? "Configurar Gobuster Arquivos" : "Configurar Gobuster",
        argsBase: tipoFuzz ? { idIp: idIp(), tipoFuzz } : { idIp: idIp() },
        campos: [
            { chave: "wordlist", rotulo: "Wordlist", tipo: "texto" },
            { chave: "extensoes", rotulo: "Extensões", tipo: "texto" }
        ],
        valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes }
    });

    return (
        <StyledToolsGrid>
            <Card className="interactive" onClick={modalNmap}>
                <div className="tool-icon">
                    <RadarChartOutlined />
                </div>
                <Card.Meta
                    title="Nmap"
                    description="Enumeração de portas."
                />
            </Card>

            <Card className="interactive" onClick={modalRustscan}>
                <div className="tool-icon">
                    <ThunderboltOutlined />
                </div>
                <Card.Meta
                    title="Rustscan"
                    description="Scan rápido de portas."
                />
            </Card>

            <Card className="interactive" onClick={modalWhatweb}>
                <div className="tool-icon">
                    <SearchOutlined />
                </div>
                <Card.Meta
                    title="WhatWeb"
                    description="Fingerprint do host."
                />
            </Card>

            <Card className="interactive" onClick={modalEnum4linux}>
                <div className="tool-icon">
                    <UserSwitchOutlined />
                </div>
                <Card.Meta
                    title="Enum4linux"
                    description="Enumeração de usuários SMB."
                />
            </Card>

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

export default FerramentasIp;
