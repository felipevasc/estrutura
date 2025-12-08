"use client"
import { useContext, useEffect, useMemo, useState } from "react";
import { Empty, Tooltip } from "antd";
import StoreContext from "@/store";
import InspectorAcoes, { GrupoAcao, gruposPorAlvo } from "./Acoes";
import { AreaConteudo, BotaoAba, ColunaAbas, CorpoInspector, InspectorBody, InspectorContainer } from "./styles";

const Inspector = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const alvo = selecaoTarget?.get();

    const gruposDisponiveis = useMemo<GrupoAcao[]>(() => gruposPorAlvo(alvo?.tipo), [alvo]);
    const [abaAtiva, definirAbaAtiva] = useState<string | null>(gruposDisponiveis[0]?.chave || null);

    useEffect(() => {
        if (!gruposDisponiveis.length) {
            definirAbaAtiva(null);
            return;
        }
        if (!abaAtiva || !gruposDisponiveis.some((grupo) => grupo.chave === abaAtiva)) {
            definirAbaAtiva(gruposDisponiveis[0].chave);
        }
    }, [gruposDisponiveis, abaAtiva]);

    return (
        <InspectorContainer>
            <CorpoInspector>
                <AreaConteudo>
                    {alvo ? (
                        abaAtiva ? (
                            <InspectorAcoes alvo={alvo as any} grupoAtivo={abaAtiva} />
                        ) : (
                            <InspectorBody>
                                <Empty description="Sem ações disponíveis" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </InspectorBody>
                        )
                    ) : (
                        <InspectorBody>
                            <Empty description="Selecione um item para ver ações" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </InspectorBody>
                    )}
                </AreaConteudo>
                <ColunaAbas>
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
