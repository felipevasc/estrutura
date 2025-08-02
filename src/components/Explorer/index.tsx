import ArvoreDominios from "../ArvoreDominios"
import MenuExplorer from "./MenuExplorer"
import { StyledExplorer } from "./styles"

const Explorer = () => {
    return <StyledExplorer>
        <MenuExplorer />
        <ArvoreDominios />
    </StyledExplorer>
}

export default Explorer