import MenuExplorer from "./MenuExplorer"
import { StyledExplorer, ExplorerHeader, ExplorerBody } from "./styles"
import { useContext } from "react"
import StoreContext from "@/store"
import { viewRegistry, getDefaultView } from "@/config/viewRegistry"
import { Input } from "antd"
import { SearchOutlined } from "@ant-design/icons"

const Explorer = () => {
    const { explorer } = useContext(StoreContext);

    const currentViewKey = explorer?.get() || 'domain';
    const CurrentView = viewRegistry[currentViewKey] || getDefaultView();

    return <StyledExplorer>
        <ExplorerHeader>
            <MenuExplorer />
            <Input
                prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Filtrar ativos..."
                variant="filled"
                size="small"
            />
        </ExplorerHeader>
        <ExplorerBody>
            {CurrentView}
        </ExplorerBody>
    </StyledExplorer>
}

export default Explorer
