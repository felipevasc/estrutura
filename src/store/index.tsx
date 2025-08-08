'use client'

import { ProjetoResponse } from "@/types/ProjetoResponse"
import { createContext, useState, ReactNode } from "react"
import { StoreType } from "./types/StoreType"
import { ExplorerType } from "@/types/ExplorerType"
import { SelecaoTargetType } from "./types/SelecaoTargetType"
import { TemaType } from "@/types/TemaType"
import { ThemeProvider } from "styled-components"
import { GlobalStyles, temas } from "@/theme"

interface StoreProviderProps {
    children: ReactNode
}

const StoreContext = createContext<StoreType>({})

export const StoreProvider = ({ children }: StoreProviderProps) => {
    const [projeto, setProjeto] = useState<ProjetoResponse>()
    const [explorer, setExplorer] = useState<ExplorerType>("domain")
    const [selecaoTarget, setSelecaoTarget] = useState<SelecaoTargetType>()
    const [tema, setTema] = useState<TemaType>("dark")

    const storeValue: StoreType = {
        projeto: {
            get: () => projeto,
            set: setProjeto
        },
        explorer: {
            get: () => explorer,
            set: e => setExplorer(e ?? "domain")
        },
        selecaoTarget: {
            get: () => selecaoTarget,
            set: setSelecaoTarget
        },
        tema: {
            get: () => tema,
            set: v => setTema(v ?? 'dark')
        }
    }

    return (
        <StoreContext.Provider value={storeValue}>
            <ThemeProvider theme={temas[tema]}>
                <GlobalStyles />
                {children}
            </ThemeProvider>
        </StoreContext.Provider>
    )
}

export default StoreContext
