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
    SearchOutlined,
    BranchesOutlined
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

const FerramentasIp = () => {
    const api = useApi();
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const [modal, definirModal] = useState<EstadoModal | null>(null);

    const abrirModal = (configuracao: EstadoModal) => definirModal({ ...configuracao, valores: { ...configuracao.valores } });

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
    const valoresWget = { profundidade: 2, limite: 200 };

    const valoresExtensoes = ".php,.html,.txt,.js,.bak,.zip,.conf";
    const wordlistPadrao = "/usr/share/wordlists/dirb/common.txt";
    const camposWhatweb: CampoConfiguracao[] = [
        {
            chave: "timeout",
            rotulo: "Timeout (segundos)",
            tipo: "numero",
            detalhe: "Tempo máximo, em segundos, para aguardar a resposta de cada requisição do WhatWeb.",
        },
        {
            chave: "agressividade",
            rotulo: "Agressividade",
            tipo: "texto",
            detalhe: "Nível de intensidade (1-5) que define quantas técnicas de fingerprint serão usadas.",
        },
        {
            chave: "userAgent",
            rotulo: "User Agent",
            tipo: "texto",
            detalhe: "Identificador de cliente enviado nas requisições; personalize para simular navegadores ou bots.",
        },
        {
            chave: "autenticacao",
            rotulo: "Autenticação",
            tipo: "texto",
            detalhe: "Credencial ou token para acessar conteúdo protegido; aceite formatos como user:senha ou Bearer token.",
        }
    ];
    const camposWordlist: CampoConfiguracao[] = [
        {
            chave: "wordlist",
            rotulo: "Wordlist",
            tipo: "texto",
            detalhe: "Caminho absoluto ou relativo da lista de palavras usada durante o fuzzing.",
        },
        {
            chave: "extensoes",
            rotulo: "Extensões",
            tipo: "texto",
            detalhe: "Extensões separadas por vírgula que serão adicionadas aos caminhos testados (ex: .php,.html).",
        }
    ];
    const camposFaixaNmap: CampoConfiguracao[] = [
        {
            chave: "faixaPortas",
            rotulo: "Faixa de portas",
            tipo: "texto",
            detalhe: "Intervalo ou lista de portas a serem varridas, como 1-9999 ou 80,443.",
        }
    ];
    const camposFaixaRustscan: CampoConfiguracao[] = [
        {
            chave: "faixaPortas",
            rotulo: "Faixa de portas",
            tipo: "texto",
            detalhe: "Intervalo ou lista de portas a serem testadas, como 1-65535 ou 22,443,8080.",
        }
    ];
    const camposEnum4linux: CampoConfiguracao[] = [
        {
            chave: "opcoes",
            rotulo: "Opções",
            tipo: "texto",
            detalhe: "Flags adicionais passadas direto ao enum4linux; combine-as conforme a enumeração desejada, ex: -U -r.",
        }
    ];
    const camposWget: CampoConfiguracao[] = [
        { chave: "profundidade", rotulo: "Profundidade máxima", tipo: "numero", detalhe: "Nível máximo de recursão para seguir links." },
        { chave: "limite", rotulo: "Limite de caminhos", tipo: "numero", detalhe: "Quantidade máxima de caminhos a registrar." }
    ];

    const modalNmap = () => abrirModal({
        comando: "nmap",
        titulo: "Configurar Nmap",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: { idIp: idIp() },
        campos: camposFaixaNmap,
        valores: { faixaPortas: "1-9999" }
    });

    const modalRustscan = () => abrirModal({
        comando: "rustscan",
        titulo: "Configurar Rustscan",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: { idIp: idIp() },
        campos: camposFaixaRustscan,
        valores: { faixaPortas: "1-65535" }
    });

    const modalWhatweb = () => abrirModal({
        comando: "whatweb",
        titulo: "Configurar WhatWeb",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: { idIp: idIp() },
        campos: camposWhatweb,
        valores: valoresWhatweb
    });

    const modalEnum4linux = () => abrirModal({
        comando: "enum4linux",
        titulo: "Configurar Enum4linux",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: { idIp: idIp() },
        campos: camposEnum4linux,
        valores: { opcoes: "-U -r" }
    });

    const modalFfuf = (tipoFuzz?: string) => abrirModal({
        comando: "ffuf",
        titulo: tipoFuzz === "arquivo" ? "Configurar Ffuf Arquivos" : "Configurar Ffuf",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: tipoFuzz ? { idIp: idIp(), tipoFuzz } : { idIp: idIp() },
        campos: camposWordlist,
        valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes }
    });

    const modalGobuster = (tipoFuzz?: string) => abrirModal({
        comando: "gobuster",
        titulo: tipoFuzz === "arquivo" ? "Configurar Gobuster Arquivos" : "Configurar Gobuster",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: tipoFuzz ? { idIp: idIp(), tipoFuzz } : { idIp: idIp() },
        campos: camposWordlist,
        valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes }
    });

    const modalWgetRecursivo = () => abrirModal({
        comando: "wgetRecursivo",
        titulo: "Configurar Wget Recursivo",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: { idIp: idIp() },
        campos: camposWget,
        valores: valoresWget
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

            <Card className="interactive" onClick={modalWgetRecursivo}>
                <div className="tool-icon">
                    <BranchesOutlined />
                </div>
                <Card.Meta
                    title="Wget Recursivo"
                    description="Rastreamento recursivo de caminhos."
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

export default FerramentasIp;
