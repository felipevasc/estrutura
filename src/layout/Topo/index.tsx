"use client"
import { StyledTopo } from "./styles";
import SelecaoProjetos from "@/components/SelecaoProjetos";
import { useContext } from "react";
import StoreContext from "@/store";
import styled from "styled-components";
import SelecaoTema from "@/components/SelecaoTema";

const StyledProjectTitle = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: var(--foreground);

    b {
        font-weight: 400;
        color: var(--accent-color);
    }
`

const ContainerDireita = styled.div`
    display: flex;
    gap: 1rem;
`

const Topo = () => {
    const { projeto } = useContext(StoreContext);

    return <StyledTopo>
        <StyledProjectTitle>
            {!!projeto?.get()?.id && <span><b>Projeto:</b> {projeto?.get()?.nome}</span>}
            {!projeto?.get()?.id && <span>Selecione um projeto</span>}
        </StyledProjectTitle>
        <ContainerDireita><SelecaoProjetos /><SelecaoTema /></ContainerDireita>
    </StyledTopo>
}

export default Topo;
