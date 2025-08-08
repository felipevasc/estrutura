"use client";
import { StyledTopo } from "./styles";
import SelecaoProjetos from "@/components/SelecaoProjetos";
import SelecaoTema from "@/components/SelecaoTema";
import { useContext } from "react";
import StoreContext from "@/store";
import styled from "styled-components";

const TituloProjeto = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: var(--foreground);
    b {
        font-weight: 400;
        color: var(--accent-color);
    }
`;

const SelecaoGrupo = styled.div`
    display: flex;
    gap: .5rem;
`;

const Topo = () => {
    const { projeto } = useContext(StoreContext);

    return <StyledTopo>
        <TituloProjeto>
            {!!projeto?.get()?.id && <span><b>Projeto:</b> {projeto?.get()?.nome}</span>}
            {!projeto?.get()?.id && <span>Selecione um projeto</span>}
        </TituloProjeto>
        <SelecaoGrupo>
            <SelecaoTema />
            <SelecaoProjetos />
        </SelecaoGrupo>
    </StyledTopo>;
};

export default Topo;
