"use client"
import { StyledTopo } from "./styles"
import SelecaoProjetos from "@/components/SelecaoProjetos"
import { useContext } from "react"
import StoreContext from "@/store"
import styled from "styled-components"
import { temas, TemaType } from "@/theme"

const StyledProjectTitle = styled.div`
    font-size: 1rem
    font-weight: 600
    color: var(--foreground)

    b {
        font-weight: 400
        color: var(--accent-color)
    }
`

const StyledControles = styled.div`
    display: flex
    align-items: center
    gap: 1rem
`

const StyledSelecaoTema = styled.select`
    background-color: ${({ theme }) => theme.colors.panelBackground}
    color: ${({ theme }) => theme.colors.foreground}
    border: 1px solid ${({ theme }) => theme.colors.borderColor}
    height: 32px
`

const Topo = () => {
    const { projeto, tema } = useContext(StoreContext)
    const nomes = Object.keys(temas) as TemaType[]

    return <StyledTopo>
        <StyledProjectTitle>
            {!!projeto?.get()?.id && <span><b>Projeto:</b> {projeto?.get()?.nome}</span>}
            {!projeto?.get()?.id && <span>Selecione um projeto</span>}
        </StyledProjectTitle>
        <StyledControles>
            <SelecaoProjetos />
            <StyledSelecaoTema value={tema?.get()} onChange={e => tema?.set(e.target.value as TemaType)}>
                {nomes.map(n => <option key={n} value={n}>{n}</option>)}
            </StyledSelecaoTema>
        </StyledControles>
    </StyledTopo>
}

export default Topo
