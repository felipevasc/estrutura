'use client';

import { ProjetoResponse } from "@/types/ProjetoResponse";
import { createContext, useState, ReactNode, useEffect } from "react";
import { ConfiguracoesType, StoreType } from "./types/StoreType";
import { ExplorerType } from "@/types/ExplorerType";
import { SelecaoTargetType } from "./types/SelecaoTargetType";
import { TipoLayout } from "@/types/TipoLayout";
import useApi from "@/api";

interface StoreProviderProps {
    children: ReactNode;
}

const StoreContext = createContext<StoreType>({});

export const StoreProvider = ({ children }: StoreProviderProps) => {
    const [projeto, setProjeto] = useState<ProjetoResponse>();
    const [explorer, setExplorer] = useState<ExplorerType>("domain");
    const [selecaoTarget, setSelecaoTarget] = useState<SelecaoTargetType>();
    const [layout, setLayout] = useState<TipoLayout>('classico');
    const [configuracoes, setConfiguracoes] = useState<ConfiguracoesType>();
    const [isConfiguracoesOpen, setIsConfiguracoesOpen] = useState(false);
    const api = useApi();

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const config = await api.configuracoes.getConfig();
                setConfiguracoes(config);
                if (!config.openaiApiKey || !config.googleApiKey || !config.googleSearchEngineId) {
                    setIsConfiguracoesOpen(true);
                }
            } catch (error) {
                console.error("Falha ao buscar configurações:", error);
                setIsConfiguracoesOpen(true); // Abre a modal em caso de erro
            }
        };
        fetchConfig();
    }, [api.configuracoes]);

    const storeValue: StoreType = {
        projeto: {
            get: () => projeto,
            set: setProjeto
        },
        explorer: {
            get: () => explorer,
            set: (e) => setExplorer(e ?? "domain")
        },
        selecaoTarget: {
            get: () => selecaoTarget,
            set: setSelecaoTarget
        },
        layout: {
            get: () => layout,
            set: (v) => setLayout(v ?? 'classico')
        },
        configuracoes: {
            get: () => configuracoes,
            set: setConfiguracoes
        },
        isConfiguracoesOpen: {
            get: () => isConfiguracoesOpen,
            set: setIsConfiguracoesOpen
        }
    };

    return (
        <StoreContext.Provider value={storeValue}>
            {children}
        </StoreContext.Provider>
    );
};

export default StoreContext;