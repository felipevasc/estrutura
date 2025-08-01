"use client"
import useApi from "@/api";
import { StyledTopo } from "./styles";

const Topo = () => {
    const api  = useApi();
    const { data, error, isLoading } = api.projeto.getProjetos();
    return <StyledTopo>Projetos: {JSON.stringify(data)}</StyledTopo>
}

export default Topo;