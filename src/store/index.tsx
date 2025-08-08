'use client';

import { ProjetoResponse } from "@/types/ProjetoResponse";
import { createContext, useState, ReactNode } from "react";
import { StoreType } from "./types/StoreType";
import { ExplorerType } from "@/types/ExplorerType";
import { SelecaoTargetType } from "./types/SelecaoTargetType";
import { TipoLayout } from "@/types/TipoLayout";

interface StoreProviderProps {
    children: ReactNode;
}

const StoreContext = createContext<StoreType>({});

export const StoreProvider = ({ children }: StoreProviderProps) => {
    const [projeto, setProjeto] = useState<ProjetoResponse>();
    const [explorer, setExplorer] = useState<ExplorerType>("domain");
    const [selecaoTarget, setSelecaoTarget] = useState<SelecaoTargetType>();
    const [layout, setLayout] = useState<TipoLayout>('classico');

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
        }
    };

    return (
        <StoreContext.Provider value={storeValue}>
            {children}
        </StoreContext.Provider>
    );
};

export default StoreContext;