import ArvoreDominios from "./arvores/ArvoreDominios"
import ArvoreUsuarios from "./arvores/ArvoreUsuarios"
import MenuExplorer from "./MenuExplorer"
import { StyledExplorer } from "./styles"
import { useContext } from "react"
import StoreContext from "@/store"

const Explorer = () => {
    const { explorer } = useContext(StoreContext);
    return <StyledExplorer>
        <MenuExplorer />
        {explorer?.get() === "user" ? <ArvoreUsuarios /> : <ArvoreDominios />}
    </StyledExplorer>
}

export default Explorer