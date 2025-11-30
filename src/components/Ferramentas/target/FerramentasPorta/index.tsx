import { Card, notification } from "antd";
import useApi from "@/api";
import { useContext, useState } from "react";
import StoreContext from "@/store";
import { StyledToolsGrid } from "../styles";
import { SearchOutlined } from "@ant-design/icons";
import ModalConfiguracaoFerramenta, { CampoConfiguracao } from "../ModalConfiguracaoFerramenta";

type EstadoModal = {
    comando: string;
    titulo: string;
    descricao?: string;
    argsBase: Record<string, unknown>;
    campos: CampoConfiguracao[];
    valores: Record<string, unknown>;
};

const FerramentasPorta = () => {
    const api = useApi();
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const [modal, definirModal] = useState<EstadoModal | null>(null);

    const abrirModal = (configuracao: EstadoModal) => definirModal({ ...configuracao, valores: { ...configuracao.valores } });

    const alterarValor = (chave: string, valor: unknown) => {
        definirModal((atual) => atual ? { ...atual, valores: { ...atual.valores, [chave]: valor } } : null);
    };

    const executar = async () => {
        if (modal && selecaoTarget?.get()?.tipo === "porta") {
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

    const idPorta = () => selecaoTarget?.get()?.id?.toString() ?? "0";

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

    const modalWhatweb = () => abrirModal({
        comando: "whatweb",
        titulo: "Configurar WhatWeb",
        descricao: "Confirme a execução e ajuste os parâmetros conforme necessário.",
        argsBase: { idPorta: idPorta() },
        campos: camposWhatweb,
        valores: { timeout: 60, agressividade: "1", userAgent: "", autenticacao: "" }
    });

    return (
        <StyledToolsGrid>
            <Card
                className="interactive"
                onClick={modalWhatweb}
            >
                <div className="tool-icon">
                    <SearchOutlined />
                </div>
                <Card.Meta
                    title="WhatWeb"
                    description="Fingerprint do serviço."
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

export default FerramentasPorta;
