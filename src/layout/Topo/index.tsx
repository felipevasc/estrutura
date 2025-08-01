"use client"
import useApi from "@/api";
import { StyledTopo } from "./styles";
import { Button, Menu } from "@/common/components";

const Topo = () => {
    const api  = useApi();
    const { data, error, isLoading } = api.projeto.getProjetos();
    return <StyledTopo>
        <div>Hacker-GovBR</div>
        <div>{data?.map(p => <Button key={p.id} darkMode>{p.nome}</Button>)}</div>
    </StyledTopo>
}

export default Topo;