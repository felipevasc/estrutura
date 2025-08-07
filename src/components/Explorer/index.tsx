import { useContext } from "react";
import StoreContext from "@/store";
import ArvoreDominios from "./arvores/ArvoreDominios";
import ArvoreRedes from "./arvores/ArvoreRedes";
import MenuExplorer from "./MenuExplorer";
import { StyledExplorer } from "./styles";

const Explorer = () => {
    const { explorer } = useContext(StoreContext);
    const view = explorer?.get();

    return (
        <StyledExplorer>
            <MenuExplorer />
            {view === "domain" && <ArvoreDominios />}
            {view === "network" && <ArvoreRedes />}
        </StyledExplorer>
    );
};

export default Explorer;