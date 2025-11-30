"use client"
import { useContext, useEffect, useMemo, useState } from "react";
import { Empty, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import StoreContext from "@/store";
import InspectorAcoes, { GrupoAcao, gruposPorAlvo } from "./Acoes";
import InspectorDetalhes from "./Detalhes";
import { AreaConteudo, BotaoAba, ColunaAbas, CorpoInspector, InspectorBody, InspectorContainer } from "./styles";

type AlvoSelecionado = {
    id: string | number;
    tipo: string;
};

const Inspector = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const alvo = selecaoTarget?.get();

    // Ensure id and tipo are present for type safety using strict checks and casting
    // Memoize to prevent re-creation on every render, which resets the active tab
    const alvoSeguro = useMemo<AlvoSelecionado | null>(() => {
        return (alvo && alvo.id !== undefined && alvo.tipo)
            ? { id: alvo.id!, tipo: alvo.tipo as string }
            : null;
    }, [alvo?.id, alvo?.tipo]);

    const gruposDisponiveis = useMemo<GrupoAcao[]>(() => gruposPorAlvo(alvoSeguro?.tipo), [alvoSeguro]);

    // Aba padrão: 'detalhes' ou a primeira ação disponível
    const [abaAtiva, definirAbaAtiva] = useState<string | null>("detalhes");

    useEffect(() => {
        // Se mudar o alvo, volta para detalhes
        definirAbaAtiva("detalhes");
    }, [alvoSeguro]);

    return (
        <InspectorContainer>
            <CorpoInspector>
                <AreaConteudo>
                    {alvoSeguro ? (
                        abaAtiva === "detalhes" ? (
                            <InspectorDetalhes alvo={alvoSeguro} />
                        ) : abaAtiva && gruposDisponiveis.some(g => g.chave === abaAtiva) ? (
                            <InspectorAcoes alvo={alvoSeguro} grupoAtivo={abaAtiva} />
                        ) : (
                            <InspectorBody>
                                <Empty description="Sem ações disponíveis" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </InspectorBody>
                        )
                    ) : (
                        <InspectorBody>
                            <Empty description="Selecione um item para ver detalhes" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </InspectorBody>
                    )}
                </AreaConteudo>
                <ColunaAbas>
                    <Tooltip placement="left" title="Detalhes">
                         <BotaoAba
                            type="button"
                            $ativo={abaAtiva === "detalhes"}
                            onClick={() => definirAbaAtiva("detalhes")}
                        >
                            <InfoCircleOutlined />
                        </BotaoAba>
                    </Tooltip>

                    {gruposDisponiveis.map((grupo) => (
                        <Tooltip placement="left" title={grupo.titulo} key={grupo.chave}>
                            <BotaoAba type="button" $ativo={grupo.chave === abaAtiva} onClick={() => definirAbaAtiva(grupo.chave)}>
                                {grupo.icone}
                            </BotaoAba>
                        </Tooltip>
                    ))}
                </ColunaAbas>
            </CorpoInspector>
        </InspectorContainer>
    );
};

export default Inspector;
