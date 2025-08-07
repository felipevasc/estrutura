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
    return <StyledRodape>
        <span>Ferramenta de Red Team | Versão 1.0</span>
    </StyledRodape>
}

export default Rodape;