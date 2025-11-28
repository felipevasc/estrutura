import { ReactNode, useContext, useMemo, useState } from "react";
import { Empty, Modal, notification } from "antd";
import { BugOutlined, DeploymentUnitOutlined, FileSearchOutlined, FolderOpenOutlined, GlobalOutlined, NodeIndexOutlined, RadarChartOutlined, SearchOutlined, ThunderboltOutlined, UserSwitchOutlined } from "@ant-design/icons";
import StoreContext from "@/store";
import useApi from "@/api";
import { DescricaoGrupo, InspectorBody, ItemAcao, TituloGrupo } from "./styles";

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

export type GrupoAcao = {
    chave: string;
    titulo: string;
    icone: ReactNode;
};

export const gruposAcoes: GrupoAcao[] = [
    { chave: "dominios", titulo: "Busca de Domínios", icone: <GlobalOutlined /> },
    { chave: "dns", titulo: "Resolução e DNS", icone: <SearchOutlined /> },
    { chave: "fuzzing", titulo: "Fuzzing", icone: <BugOutlined /> },
    { chave: "ips", titulo: "Busca por IPs", icone: <RadarChartOutlined /> },
    { chave: "usuarios", titulo: "Busca de Usuários", icone: <UserSwitchOutlined /> },
];

const acoesPorGrupo: Record<string, AcaoDisponivel[]> = {
    dominios: [
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
            chave: "subfinder",
            titulo: "Subfinder",
            descricao: "Subdomínios passivos",
            comando: "subfinder",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <NodeIndexOutlined />,
        },
    ],
    dns: [
        {
            chave: "nslookup",
            titulo: "NsLookup",
            descricao: "Resolução de IPs",
            comando: "nslookup",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <SearchOutlined />,
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
            chave: "gobusterDominio",
            titulo: "Gobuster",
            descricao: "Descoberta de diretórios",
            comando: "gobuster",
            tiposAlvo: ["domain"],
            gerarParametros: (alvo) => ({ idDominio: alvo.id.toString() }),
            icone: <FolderOpenOutlined />,
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
            chave: "gobusterIp",
            titulo: "Gobuster",
            descricao: "Descoberta de diretórios",
            comando: "gobuster",
            tiposAlvo: ["ip"],
            gerarParametros: (alvo) => ({ idIp: alvo.id.toString() }),
            icone: <FolderOpenOutlined />,
        },
    ],
    ips: [
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
    const [modalVisivel, definirModalVisivel] = useState(false);
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

    const abrirConfirmacao = (acao: AcaoDisponivel) => {
        definirAcaoSelecionada(acao);
        definirModalVisivel(true);
    };

    const executarAcao = async () => {
        const projetoAtual = projeto?.get();
        if (acaoSelecionada && projetoAtual && alvo) {
            const parametros = acaoSelecionada.gerarParametros(alvo);
            try {
                await api.queue.addCommand(acaoSelecionada.comando, parametros, projetoAtual.id);
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
        definirModalVisivel(false);
        definirAcaoSelecionada(null);
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
                <ItemAcao key={acao.chave} onClick={() => abrirConfirmacao(acao)}>
                    <div className="info">
                        <strong>{acao.titulo}</strong>
                        <span>{acao.descricao}</span>
                    </div>
                    {acao.icone}
                </ItemAcao>
            ))}

            <Modal
                title="Confirmar Execução"
                open={modalVisivel}
                onOk={executarAcao}
                onCancel={() => definirModalVisivel(false)}
                okText="Executar"
                cancelText="Cancelar"
            >
                <p>Executar <strong>{acaoSelecionada?.titulo}</strong> neste alvo?</p>
            </Modal>
        </InspectorBody>
    );
};

export default InspectorAcoes;
