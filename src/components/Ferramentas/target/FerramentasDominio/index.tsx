import { Card, notification } from "antd";
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
import ModalConfiguracaoFerramenta, { CampoConfiguracao } from "../ModalConfiguracaoFerramenta";

type EstadoModal = {
    comando: string;
    titulo: string;
    descricao?: string;
    argsBase: Record<string, unknown>;
    campos: CampoConfiguracao[];
    valores: Record<string, unknown>;
};

const FerramentasDominio = () => {
    const api = useApi();
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const [modal, definirModal] = useState<EstadoModal | null>(null);

    const abrirModal = (configuracao: EstadoModal) => definirModal({ ...configuracao, valores: { ...configuracao.valores } });

    const alterarValor = (chave: string, valor: unknown) => {
        definirModal((atual) => atual ? { ...atual, valores: { ...atual.valores, [chave]: valor } } : null);
    };

    const executar = async () => {
        if (modal && selecaoTarget?.get()?.tipo === "domain") {
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

    const idDominio = () => selecaoTarget?.get()?.id?.toString() ?? "0";

    const valoresWhatweb = {
        timeout: 60,
        agressividade: "1",
        userAgent: "",
        autenticacao: ""
    };

    const valoresExtensoes = ".php,.html,.txt,.js,.bak,.zip,.conf";
    const wordlistPadrao = "/usr/share/wordlists/dirb/common.txt";
    const valoresFindomain = { threads: 10, timeout: 60, modoSilencioso: true };

    const modalAmass = () => abrirModal({
        comando: "amass",
        titulo: "Configurar Amass",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: { idDominio: idDominio() },
        campos: [{ chave: "timeoutMinutos", rotulo: "Timeout (minutos)", tipo: "numero" }],
        valores: { timeoutMinutos: 5 }
    });

    const modalSubfinder = () => abrirModal({
        comando: "subfinder",
        titulo: "Configurar Subfinder",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: { idDominio: idDominio() },
        campos: [
            { chave: "todasFontes", rotulo: "Usar todas as fontes", tipo: "booleano" },
            { chave: "modoSilencioso", rotulo: "Modo silencioso", tipo: "booleano" }
        ],
        valores: { todasFontes: true, modoSilencioso: true }
    });

    const modalWhatweb = () => abrirModal({
        comando: "whatweb",
        titulo: "Configurar WhatWeb",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: { idDominio: idDominio() },
        campos: [
            { chave: "timeout", rotulo: "Timeout (segundos)", tipo: "numero" },
            { chave: "agressividade", rotulo: "Agressividade", tipo: "texto" },
            { chave: "userAgent", rotulo: "User Agent", tipo: "texto" },
            { chave: "autenticacao", rotulo: "Autenticação", tipo: "texto", descricao: "Ex: Bearer token" }
        ],
        valores: valoresWhatweb
    });

    const modalFindomain = () => abrirModal({
        comando: "findomain",
        titulo: "Configurar Findomain",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: { idDominio: idDominio() },
        campos: [
            { chave: "threads", rotulo: "Threads", tipo: "numero" },
            { chave: "timeout", rotulo: "Timeout (segundos)", tipo: "numero" },
            { chave: "modoSilencioso", rotulo: "Modo silencioso", tipo: "booleano" }
        ],
        valores: valoresFindomain
    });

    const modalNslookup = () => abrirModal({
        comando: "nslookup",
        titulo: "Configurar NsLookup",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: { idDominio: idDominio() },
        campos: [{ chave: "servidorDns", rotulo: "Servidor DNS", tipo: "texto" }],
        valores: { servidorDns: "8.8.8.8" }
    });

    const modalFfuf = (tipoFuzz?: string) => abrirModal({
        comando: "ffuf",
        titulo: tipoFuzz === "arquivo" ? "Configurar Ffuf Arquivos" : "Configurar Ffuf",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: tipoFuzz ? { idDominio: idDominio(), tipoFuzz } : { idDominio: idDominio() },
        campos: [
            { chave: "wordlist", rotulo: "Wordlist", tipo: "texto" },
            { chave: "extensoes", rotulo: "Extensões", tipo: "texto" }
        ],
        valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes }
    });

    const modalGobuster = (tipoFuzz?: string) => abrirModal({
        comando: "gobuster",
        titulo: tipoFuzz === "arquivo" ? "Configurar Gobuster Arquivos" : "Configurar Gobuster",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: tipoFuzz ? { idDominio: idDominio(), tipoFuzz } : { idDominio: idDominio() },
        campos: [
            { chave: "wordlist", rotulo: "Wordlist", tipo: "texto" },
            { chave: "extensoes", rotulo: "Extensões", tipo: "texto" }
        ],
        valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes }
    });

    return (
        <StyledToolsGrid>
            <Card className="interactive" onClick={modalAmass}>
                <div className="tool-icon">
                    <DeploymentUnitOutlined />
                </div>
                <Card.Meta
                    title="Amass"
                    description="Enumeração de subdomínios e descoberta de assets."
                />
            </Card>

            <Card className="interactive" onClick={modalSubfinder}>
                <div className="tool-icon">
                    <NodeIndexOutlined />
                </div>
                <Card.Meta
                    title="Subfinder"
                    description="Descoberta de subdomínios passivos."
                />
            </Card>

            <Card className="interactive" onClick={modalWhatweb}>
                <div className="tool-icon">
                    <SearchOutlined />
                </div>
                <Card.Meta
                    title="WhatWeb"
                    description="Fingerprint do domínio."
                />
            </Card>

            <Card className="interactive" onClick={modalFindomain}>
                <div className="tool-icon">
                    <AimOutlined />
                </div>
                <Card.Meta
                    title="Findomain"
                    description="Monitoramento e descoberta de subdomínios."
                />
            </Card>

            <Card className="interactive" onClick={modalNslookup}>
                <div className="tool-icon">
                    <SearchOutlined />
                </div>
                <Card.Meta
                    title="NsLookup"
                    description="Descobrir IPs de um domínio."
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
                descricao={modal?.descricao}
                campos={modal?.campos ?? []}
                valores={modal?.valores ?? {}}
                aoAlterar={alterarValor}
                aoCancelar={() => definirModal(null)}
                aoConfirmar={executar}
            />
        </StyledToolsGrid>
    );
};

export default FerramentasDominio;
