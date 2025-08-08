"use client"
import { StyledTopo, StyledSelecoes } from "./styles";
import SelecaoProjetos from "@/components/SelecaoProjetos";
import SelecaoLayout from "@/components/SelecaoLayout";
import { useContext } from "react";
import StoreContext from "@/store";
import styled from "styled-components";

const StyledProjectTitle = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: var(--foreground);

    b {
        font-weight: 400;
        color: var(--accent-color);
    }
`;

const Topo = () => {
    const { projeto } = useContext(StoreContext);

    return <StyledTopo>
        <StyledProjectTitle>
            {!!projeto?.get()?.id && <span><b>Projeto:</b> {projeto?.get()?.nome}</span>}
            {!projeto?.get()?.id && <span>Selecione um projeto</span>}
        </StyledProjectTitle>
        <StyledSelecoes>
            <SelecaoProjetos />
            <SelecaoLayout />
        </StyledSelecoes>
    </StyledTopo>
};

export default Topo;