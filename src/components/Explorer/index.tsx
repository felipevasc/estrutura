import MenuExplorer from "./MenuExplorer"
import { StyledExplorer } from "./styles"
import { useContext } from "react"
import StoreContext from "@/store"
import { viewRegistry, getDefaultView } from "@/config/viewRegistry"

const Explorer = () => {
    const { explorer } = useContext(StoreContext);

    const currentViewKey = explorer?.get() || 'domain';
    const CurrentView = viewRegistry[currentViewKey] || getDefaultView();

    return <StyledExplorer>
        <MenuExplorer />
        {CurrentView}
    </StyledExplorer>
}

export default Explorer
