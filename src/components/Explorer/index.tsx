import { useContext } from "react";
import StoreContext from "@/store";
import ArvoreDominios from "./arvores/ArvoreDominios";
import ArvoreIps from "./arvores/ArvoreIps";
import MenuExplorer from "./MenuExplorer";
import { StyledExplorer } from "./styles";

const Explorer = () => {
    const { explorer } = useContext(StoreContext);
    const currentView = explorer?.get();

    return (
        <StyledExplorer>
            <MenuExplorer />
            {currentView === 'domain' && <ArvoreDominios />}
            {currentView === 'ip' && <ArvoreIps />}
            {/* Placeholder for other views */}
            {currentView === 'network' && <div>Rede View</div>}
            {currentView === 'user' && <div>Usuário View</div>}
            {currentView === 'database' && <div>Database View</div>}
        </StyledExplorer>
    );
}

export default Explorer;