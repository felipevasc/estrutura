import { ReactNode, useContext, useMemo, useState } from "react";
import { Empty, notification } from "antd";
import { BranchesOutlined, BugOutlined, DeploymentUnitOutlined, FileSearchOutlined, FolderOpenOutlined, GlobalOutlined, NodeIndexOutlined, RadarChartOutlined, SearchOutlined, ThunderboltOutlined, UserSwitchOutlined } from "@ant-design/icons";
import StoreContext from "@/store";
import useApi from "@/api";
import { DescricaoGrupo, InspectorBody, ItemAcao, TituloGrupo } from "./styles";
import ModalConfiguracaoFerramenta, { CampoConfiguracao } from "@/components/Ferramentas/target/ModalConfiguracaoFerramenta";

type AlvoSelecionado = {
    id: string | number;
    tipo: string;
};

type AcaoDisponivel = {
    chave: string;
    titulo: string;
    descricao: string;
    comando: string;
    tiposAlvo: string[];
    gerarParametros: (alvo: AlvoSelecionado) => Record<string, unknown>;
    icone: ReactNode;
};

type EstadoModal = {
    comando: string;
    titulo: string;
    descricao?: string;
    argsBase: Record<string, unknown>;
    campos: CampoConfiguracao[];
    valores: Record<string, unknown>;
};

const tituloModal = (titulo: string) => `Configurar ${titulo}`;

const valoresWhatweb = { timeout: 60, agressividade: "1", userAgent: "", autenticacao: "" };
const valoresExtensoes = ".php,.html,.txt,.js,.bak,.zip,.conf";
const wordlistPadrao = "/usr/share/wordlists/dirb/common.txt";
const valoresWget = { profundidade: 2, limite: 200 };

export type GrupoAcao = {
    chave: string;
    titulo: string;
    icone: ReactNode;
};

export const gruposAcoes: GrupoAcao[] = [
    { chave: "dominios", titulo: "Busca de Domínios", icone: <GlobalOutlined /> },
    { chave: "fuzzing", titulo: "Fuzzing", icone: <BugOutlined /> },
    { chave: "ips", titulo: "Busca de IPs", icone: <RadarChartOutlined /> },
    { chave: "usuarios", titulo: "Busca de Usuários", icone: <UserSwitchOutlined /> },
];

const acoesPorGrupo: Record<string, AcaoDisponivel[]> = {
    dominios: [
        {
            chave: "dnsenumDominio",
            titulo: "Dnsenum",
            descricao: "Enumeração de subdomínios e IPs",
            comando: "dnsenum",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <DeploymentUnitOutlined />,
        },
        {
            chave: "amass",
            titulo: "Amass",
            descricao: "Enumeração de assets",
            comando: "amass",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <DeploymentUnitOutlined />,
        },
        {
            chave: "whatwebDominio",
            titulo: "WhatWeb",
            descricao: "Fingerprint do domínio",
            comando: "whatweb",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <SearchOutlined />,
        },
        {
            chave: "subfinder",
            titulo: "Subfinder",
            descricao: "Subdomínios passivos",
            comando: "subfinder",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <NodeIndexOutlined />,
        },
    ],
    fuzzing: [
        {
            chave: "ffufDominio",
            titulo: "Ffuf",
            descricao: "Fuzzing de diretórios",
            comando: "ffuf",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <FileSearchOutlined />,
        },
        {
            chave: "ffufArquivosDominio",
            titulo: "Ffuf Arquivos",
            descricao: "Fuzzing de arquivos",
            comando: "ffuf",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString(), tipoFuzz: "arquivo" }),
            icone: <FileSearchOutlined />,
        },
        {
            chave: "gobusterDominio",
            titulo: "Gobuster",
            descricao: "Descoberta de diretórios",
            comando: "gobuster",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <FolderOpenOutlined />,
        },
        {
            chave: "gobusterArquivosDominio",
            titulo: "Gobuster Arquivos",
            descricao: "Descoberta de arquivos",
            comando: "gobuster",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString(), tipoFuzz: "arquivo" }),
            icone: <FolderOpenOutlined />,
        },
        {
            chave: "wgetRecursivoDominio",
            titulo: "Wget Recursivo",
            descricao: "Rastreamento recursivo",
            comando: "wgetRecursivo",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <BranchesOutlined />,
        },
        {
            chave: "ffufIp",
            titulo: "Ffuf",
            descricao: "Fuzzing de diretórios",
            comando: "ffuf",
            tiposAlvo: ["ip"],
            gerarParametros: (alvo) => ({ idIp: alvo.id.toString() }),
            icone: <FileSearchOutlined />,
        },
        {
            chave: "ffufArquivosIp",
            titulo: "Ffuf Arquivos",
            descricao: "Fuzzing de arquivos",
            comando: "ffuf",
            tiposAlvo: ["ip"],
            gerarParametros: (alvo) => ({ idIp: alvo.id.toString(), tipoFuzz: "arquivo" }),
            icone: <FileSearchOutlined />,
        },
        {
            chave: "gobusterIp",
            titulo: "Gobuster",
            descricao: "Descoberta de diretórios",
            comando: "gobuster",
            tiposAlvo: ["ip"],
            gerarParametros: (alvo) => ({ idIp: alvo.id.toString() }),
            icone: <FolderOpenOutlined />,
        },
        {
            chave: "gobusterArquivosIp",
            titulo: "Gobuster Arquivos",
            descricao: "Descoberta de arquivos",
            comando: "gobuster",
            tiposAlvo: ["ip"],
            gerarParametros: (alvo) => ({ idIp: alvo.id.toString(), tipoFuzz: "arquivo" }),
            icone: <FolderOpenOutlined />,
        },
        {
            chave: "wgetRecursivoIp",
            titulo: "Wget Recursivo",
            descricao: "Rastreamento recursivo",
            comando: "wgetRecursivo",
            tiposAlvo: ["ip"],
            gerarParametros: (alvo) => ({ idIp: alvo.id.toString() }),
            icone: <BranchesOutlined />,
        },
        {
            chave: "ffufDiretorio",
            titulo: "Ffuf",
            descricao: "Fuzzing do caminho selecionado",
            comando: "ffuf",
            tiposAlvo: ["diretorio"],
            gerarParametros: (alvo) => ({ idDiretorio: alvo.id.toString() }),
            icone: <FileSearchOutlined />,
        },
        {
            chave: "ffufArquivosDiretorio",
            titulo: "Ffuf Arquivos",
            descricao: "Fuzzing de arquivos no caminho",
            comando: "ffuf",
            tiposAlvo: ["diretorio"],
            gerarParametros: (alvo) => ({ idDiretorio: alvo.id.toString(), tipoFuzz: "arquivo" }),
            icone: <FileSearchOutlined />,
        },
        {
            chave: "gobusterDiretorio",
            titulo: "Gobuster",
            descricao: "Descoberta no caminho selecionado",
            comando: "gobuster",
            tiposAlvo: ["diretorio"],
            gerarParametros: (alvo) => ({ idDiretorio: alvo.id.toString() }),
            icone: <FolderOpenOutlined />,
        },
        {
            chave: "gobusterArquivosDiretorio",
            titulo: "Gobuster Arquivos",
            descricao: "Descoberta de arquivos no caminho",
            comando: "gobuster",
            tiposAlvo: ["diretorio"],
            gerarParametros: (alvo) => ({ idDiretorio: alvo.id.toString(), tipoFuzz: "arquivo" }),
            icone: <FolderOpenOutlined />,
        },
        {
            chave: "wgetRecursivoDiretorio",
            titulo: "Wget Recursivo",
            descricao: "Rastreamento recursivo",
            comando: "wgetRecursivo",
            tiposAlvo: ["diretorio"],
            gerarParametros: (alvo) => ({ idDiretorio: alvo.id.toString() }),
            icone: <BranchesOutlined />,
        },
        {
            chave: "whatwebDiretorio",
            titulo: "WhatWeb",
            descricao: "Fingerprint do caminho",
            comando: "whatweb",
            tiposAlvo: ["diretorio"],
            gerarParametros: (alvo) => ({ idDiretorio: alvo.id.toString() }),
            icone: <SearchOutlined />,
        },
    ],
    ips: [
        {
            chave: "nslookup",
            titulo: "NsLookup",
            descricao: "Resolução de IPs",
            comando: "nslookup",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <SearchOutlined />,
        },
        {
            chave: "dnsenumIp",
            titulo: "Dnsenum",
            descricao: "Resolução de IPs",
            comando: "dnsenum",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <SearchOutlined />,
        },
        {
            chave: "nmap",
            titulo: "Nmap",
            descricao: "Scan de portas",
            comando: "nmap",
            tiposAlvo: ["ip"],
            gerarParametros: (alvo) => ({ idIp: alvo.id.toString() }),
            icone: <RadarChartOutlined />,
        },
        {
            chave: "rustscan",
            titulo: "Rustscan",
            descricao: "Scan rápido de portas",
            comando: "rustscan",
            tiposAlvo: ["ip"],
            gerarParametros: (alvo) => ({ idIp: alvo.id.toString() }),
            icone: <ThunderboltOutlined />,
        },
        {
            chave: "whatwebIp",
            titulo: "WhatWeb",
            descricao: "Fingerprint do host",
            comando: "whatweb",
            tiposAlvo: ["ip"],
            gerarParametros: (alvo) => ({ idIp: alvo.id.toString() }),
            icone: <SearchOutlined />,
        },
    ],
    usuarios: [
        {
            chave: "enum4linux",
            titulo: "Enum4Linux",
            descricao: "Enumeração SMB",
            comando: "enum4linux",
            tiposAlvo: ["ip"],
            gerarParametros: (alvo) => ({ idIp: alvo.id.toString() }),
            icone: <UserSwitchOutlined />,
        },
    ],
};

const descricaoModal = "Confirme a execução e ajuste os parâmetros conforme necessário.";

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
    },
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
    },
];
const camposWget: CampoConfiguracao[] = [
    { chave: "profundidade", rotulo: "Profundidade máxima", tipo: "numero", detalhe: "Nível máximo de recursão para seguir links." },
    { chave: "limite", rotulo: "Limite de caminhos", tipo: "numero", detalhe: "Quantidade máxima de caminhos a registrar." },
];

const criarModalAcao = (acao: AcaoDisponivel, alvo: AlvoSelecionado): EstadoModal | null => {
    const id = alvo.id.toString();
    if (acao.chave === "dnsenumDominio" || acao.chave === "dnsenumIp") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDominio: id },
            campos: [
                { chave: "threads", rotulo: "Threads", tipo: "numero", detalhe: "Número de threads para processamento." },
                { chave: "wordlist", rotulo: "Wordlist", tipo: "texto", detalhe: "Caminho da wordlist para força bruta." },
            ],
            valores: { threads: 5, wordlist: "db/wordlists/subdomains.txt" },
        };
    }
    if (acao.chave === "amass") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDominio: id },
            campos: [{ chave: "timeoutMinutos", rotulo: "Timeout (minutos)", tipo: "numero", detalhe: "Tempo máximo, em minutos, antes de interromper a execução do Amass." }],
            valores: { timeoutMinutos: 5 },
        };
    }
    if (acao.chave === "subfinder") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDominio: id },
            campos: [
                { chave: "todasFontes", rotulo: "Usar todas as fontes", tipo: "booleano", detalhe: "Ativa todas as fontes disponíveis no Subfinder para ampliar a enumeração." },
                { chave: "modoSilencioso", rotulo: "Modo silencioso", tipo: "booleano", detalhe: "Reduz a verbosidade do Subfinder para manter apenas saídas essenciais." },
            ],
            valores: { todasFontes: true, modoSilencioso: true },
        };
    }
    if (acao.chave === "whatwebDominio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDominio: id },
            campos: camposWhatweb,
            valores: { ...valoresWhatweb },
        };
    }
    if (acao.chave === "nslookup") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDominio: id },
            campos: [{ chave: "servidorDns", rotulo: "Servidor DNS", tipo: "texto", detalhe: "Servidor que responderá às consultas; use um IP ou hostname como 8.8.8.8." }],
            valores: { servidorDns: "8.8.8.8" },
        };
    }
    if (acao.chave === "ffufDominio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDominio: id },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "ffufArquivosDominio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDominio: id, tipoFuzz: "arquivo" },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "gobusterDominio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDominio: id },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "gobusterArquivosDominio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDominio: id, tipoFuzz: "arquivo" },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "ffufIp") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idIp: id },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "ffufArquivosIp") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idIp: id, tipoFuzz: "arquivo" },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "gobusterIp") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idIp: id },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "gobusterArquivosIp") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idIp: id, tipoFuzz: "arquivo" },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "ffufDiretorio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDiretorio: id },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "ffufArquivosDiretorio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDiretorio: id, tipoFuzz: "arquivo" },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "gobusterDiretorio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDiretorio: id },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "gobusterArquivosDiretorio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDiretorio: id, tipoFuzz: "arquivo" },
            campos: camposWordlist,
            valores: { wordlist: wordlistPadrao, extensoes: valoresExtensoes },
        };
    }
    if (acao.chave === "wgetRecursivoDominio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDominio: id },
            campos: camposWget,
            valores: valoresWget,
        };
    }
    if (acao.chave === "wgetRecursivoIp") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idIp: id },
            campos: camposWget,
            valores: valoresWget,
        };
    }
    if (acao.chave === "wgetRecursivoDiretorio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDiretorio: id },
            campos: camposWget,
            valores: valoresWget,
        };
    }
    if (acao.chave === "whatwebDiretorio") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idDiretorio: id },
            campos: camposWhatweb,
            valores: { ...valoresWhatweb },
        };
    }
    if (acao.chave === "nmap") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idIp: id },
            campos: [{ chave: "faixaPortas", rotulo: "Faixa de portas", tipo: "texto", detalhe: "Intervalo ou lista de portas a serem varridas, como 1-9999 ou 80,443." }],
            valores: { faixaPortas: "1-9999" },
        };
    }
    if (acao.chave === "rustscan") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idIp: id },
            campos: [{ chave: "faixaPortas", rotulo: "Faixa de portas", tipo: "texto", detalhe: "Intervalo ou lista de portas a serem testadas, como 1-65535 ou 22,443,8080." }],
            valores: { faixaPortas: "1-65535" },
        };
    }
    if (acao.chave === "whatwebIp") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idIp: id },
            campos: camposWhatweb,
            valores: { ...valoresWhatweb },
        };
    }
    if (acao.chave === "enum4linux") {
        return {
            comando: acao.comando,
            titulo: tituloModal(acao.titulo),
            descricao: descricaoModal,
            argsBase: { idIp: id },
            campos: [{ chave: "opcoes", rotulo: "Opções", tipo: "texto", detalhe: "Flags adicionais passadas direto ao enum4linux; combine-as conforme a enumeração desejada, ex: -U -r." }],
            valores: { opcoes: "-U -r" },
        };
    }
    return null;
};

export const gruposPorAlvo = (tipoAlvo?: string | null) => gruposAcoes.filter((grupo) =>
    (acoesPorGrupo[grupo.chave] || []).some((acao) => !tipoAlvo || acao.tiposAlvo.includes(tipoAlvo)),
);

type PropsAcoes = {
    alvo: AlvoSelecionado | null;
    grupoAtivo: string | null;
};

const InspectorAcoes = ({ alvo, grupoAtivo }: PropsAcoes) => {
    const { projeto } = useContext(StoreContext);
    const api = useApi();
    const [modal, definirModal] = useState<EstadoModal | null>(null);
    const [acaoSelecionada, definirAcaoSelecionada] = useState<AcaoDisponivel | null>(null);

    const acoesDisponiveis = useMemo(() => {
        if (!alvo || !grupoAtivo) return [];
        return (acoesPorGrupo[grupoAtivo] || []).filter((acao) => acao.tiposAlvo.includes(alvo.tipo));
    }, [alvo, grupoAtivo]);

    const grupoAtual = useMemo(() => gruposAcoes.find((grupo) => grupo.chave === grupoAtivo), [grupoAtivo]);

    if (!alvo) {
        return (
            <InspectorBody>
                <Empty description="Selecione um item para ver ações" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </InspectorBody>
        );
    }

    if (!grupoAtivo || acoesDisponiveis.length === 0) {
        return (
            <InspectorBody>
                <Empty description="Sem ações disponíveis" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </InspectorBody>
        );
    }

    const abrirConfiguracao = (acao: AcaoDisponivel) => {
        if (!alvo) return;
        const configuracao = criarModalAcao(acao, alvo);
        if (configuracao) {
            definirAcaoSelecionada(acao);
            definirModal(configuracao);
        }
    };

    const alterarValor = (chave: string, valor: unknown) => {
        definirModal((atual) => atual ? { ...atual, valores: { ...atual.valores, [chave]: valor } } : null);
    };

    const fecharModal = () => {
        definirModal(null);
        definirAcaoSelecionada(null);
    };

    const executarAcao = async () => {
        const projetoAtual = projeto?.get();
        if (acaoSelecionada && projetoAtual && modal) {
            try {
                await api.queue.addCommand(acaoSelecionada.comando, { ...modal.argsBase, ...modal.valores }, projetoAtual.id);
                notification.success({
                    message: "Comando iniciado",
                    description: `${acaoSelecionada.comando} adicionado à fila.`,
                    placement: "bottomRight",
                });
            } catch {
                notification.error({
                    message: "Erro",
                    description: "Falha ao iniciar comando.",
                    placement: "bottomRight",
                });
            }
        }
        fecharModal();
    };

    return (
        <InspectorBody>
            {grupoAtual && (
                <>
                    <TituloGrupo>
                        {grupoAtual.icone}
                        <span>{grupoAtual.titulo}</span>
                    </TituloGrupo>
                    <DescricaoGrupo>Ferramentas relacionadas ao tipo selecionado.</DescricaoGrupo>
                </>
            )}

            {acoesDisponiveis.map((acao) => (
                <ItemAcao key={acao.chave} onClick={() => abrirConfiguracao(acao)}>
                    <div className="info">
                        <strong>{acao.titulo}</strong>
                        <span>{acao.descricao}</span>
                    </div>
                    {acao.icone}
                </ItemAcao>
            ))}

            <ModalConfiguracaoFerramenta
                aberto={!!modal}
                titulo={modal?.titulo ?? ""}
                descricao={modal?.descricao}
                campos={modal?.campos ?? []}
                valores={modal?.valores ?? {}}
                aoAlterar={alterarValor}
                aoCancelar={fecharModal}
                aoConfirmar={executarAcao}
            />
        </InspectorBody>
    );
};

export default InspectorAcoes;
