"use client"
import { StyledTopo } from "./styles";
import SelecaoProjetos from "@/components/SelecaoProjetos";
import { useContext } from "react";
import StoreContext from "@/store";

const Topo = () => {
    const { projeto } = useContext(StoreContext);

    return <StyledTopo>
        {!!projeto?.get()?.id && <div><b>Projeto:</b> {projeto?.get()?.nome}</div>}
        {!projeto?.get()?.id && <div><b>Selecione um projeto</b></div>}
        <div><SelecaoProjetos /></div>
    </StyledTopo>
}

export default Topo;