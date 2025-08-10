import { useContext } from "react";
import ArvoreDominios from "./arvores/ArvoreDominios";
import ArvoreUsuarios from "./arvores/ArvoreUsuarios";
import MenuExplorer from "./MenuExplorer";
import { StyledExplorer } from "./styles";
import StoreContext from "@/store";

const Explorer = () => {
    const { explorer } = useContext(StoreContext);
    const renderExplorer = () => {
        switch (explorer?.get()) {
            case "domain":
                return <ArvoreDominios />;
            case "user":
                return <ArvoreUsuarios />;
            default:
                return <ArvoreDominios />;
        }
    }

    return <StyledExplorer>
        <MenuExplorer />
        {renderExplorer()}
    </StyledExplorer>
}

export default Explorer