import { useContext, useState } from "react"
import StoreContext from "@/store"
import { DropdownContainer, DropdownButton, DropdownContent } from "../SelecaoProjetos/styles"
import { TipoLayout } from "@/types/TipoLayout"

const opcoes: { id: TipoLayout; nome: string }[] = [
  { id: "classico", nome: "Clássico" },
  { id: "hacker", nome: "Hacker" },
  { id: "fofinho", nome: "Fofinho" },
  { id: "elegante", nome: "Elegante" },
  { id: "dark", nome: "Dark" },
  { id: "clean", nome: "Clean" }
]

const SelecaoLayout = () => {
  const { layout } = useContext(StoreContext)
  const [aberto, setAberto] = useState(false)
  const atual = layout?.get() ?? "classico"
  return (
    <DropdownContainer>
      <DropdownButton onClick={() => setAberto(!aberto)}>
        {opcoes.find(o => o.id === atual)?.nome}
      </DropdownButton>
      {aberto && (
        <DropdownContent>
          {opcoes.map(o => (
            <a key={o.id} onClick={() => { layout?.set(o.id); setAberto(false) }}>
              {o.nome}
            </a>
          ))}
        </DropdownContent>
      )}
    </DropdownContainer>
  )
}

export default SelecaoLayout
