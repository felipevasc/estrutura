import { useContext, useState } from "react"
import StoreContext from "@/store"
import { DropdownContainer, DropdownButton, DropdownContent } from "./styles"
import { TemaType } from "@/types/TemaType"

const nomes: Record<TemaType, string> = {
    classico: 'Clássico',
    hacker: 'Hacker',
    fofo: 'Fofinho',
    elegante: 'Elegante',
    dark: 'Dark',
    clean: 'Clean'
}

const SelecaoLayout = () => {
    const { tema } = useContext(StoreContext)
    const [aberto, setAberto] = useState(false)
    const atual = tema?.get() ?? 'dark'

    return <DropdownContainer>
        <DropdownButton onClick={() => setAberto(!aberto)}>{nomes[atual]}</DropdownButton>
        {aberto && <DropdownContent>
            {(Object.keys(nomes) as TemaType[]).map(t =>
                <a key={t} onClick={() => { tema?.set(t); setAberto(false) }}>
                    {nomes[t]}
                </a>
            )}
        </DropdownContent>}
    </DropdownContainer>
}

export default SelecaoLayout
