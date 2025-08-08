import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { useContext, useState } from 'react'
import StoreContext from '@/store'
import { TemaType } from '@/store/types/TemaType'
import { DropdownContainer, DropdownButton, DropdownContent } from '@/components/SelecaoProjetos/styles'

const opcoes = [
  { valor: 'classico', rotulo: 'Clássico' },
  { valor: 'hacker', rotulo: 'Hacker' },
  { valor: 'fofinho', rotulo: 'Fofinho' },
  { valor: 'elegante', rotulo: 'Elegante' },
  { valor: 'dark', rotulo: 'Dark' },
  { valor: 'clean', rotulo: 'Clean' }
]

const SelecaoLayout = () => {
  const { tema } = useContext(StoreContext)
  const [aberto, setAberto] = useState(false)
  const atual = opcoes.find(o => o.valor === tema?.get())?.rotulo || 'Layout'

  return (
    <DropdownContainer>
      <DropdownButton onClick={() => setAberto(!aberto)}>
        {atual} <FontAwesomeIcon icon={faChevronDown} />
      </DropdownButton>
      {aberto && (
        <DropdownContent>
          {opcoes.map(o => (
            <a key={o.valor} onClick={() => { tema?.set(o.valor as TemaType); setAberto(false) }}>
              {o.rotulo}
            </a>
          ))}
        </DropdownContent>
      )}
    </DropdownContainer>
  )
}

export default SelecaoLayout

