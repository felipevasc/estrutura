import StatusBar from "@/components/StatusBar";
import { StyledRodape } from "./styles";
import styled from "styled-components";

const StyledLink = styled.a`
    color: var(--accent-color);
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`

const Rodape = () => {
    return <StatusBar />
}

export default Rodape;