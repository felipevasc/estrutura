'use client';

import { ProjetoResponse } from "@/types/ProjetoResponse";
import { createContext, useState, ReactNode } from "react";
import { StoreType } from "./types/StoreType";
import { ExplorerType } from "@/types/ExplorerType";

type ObjetoGenerico = any;



interface StoreProviderProps {
    children: ReactNode;
}

const StoreContext = createContext<StoreType>({});

export const StoreProvider = ({ children }: StoreProviderProps) => {
    const [projeto, setProjeto] = useState<ProjetoResponse>();
    const [explorer, setExplorer] = useState<ExplorerType>("domain");

    const storeValue: StoreType = {
        projeto: {
            get: () => projeto,
            set: setProjeto
        },
        explorer: {
            get: () => explorer,
            set: (e) => setExplorer(e ?? "domain")
        }
    };

    return (
        <StoreContext.Provider value={storeValue}>
            {children}
        </StoreContext.Provider>
    );
};

export default StoreContext;