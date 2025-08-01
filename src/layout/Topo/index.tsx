"use client"
import useApi from "@/api";
import { StyledTopo } from "./styles";
import { Button, Menu } from "@/common/components";
import SelecaoProjetos from "@/components/SelecaoProjetos";

const Topo = () => {
    const api  = useApi();
    const { data, error, isLoading } = api.projeto.getProjetos();
    return <StyledTopo>
        <div><b>Projeto:</b> </div>
        <div><SelecaoProjetos /></div>
    </StyledTopo>
}

export default Topo;