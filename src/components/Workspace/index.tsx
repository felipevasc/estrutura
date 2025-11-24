import { useContext } from "react";
import StoreContext from "@/store";
import { WorkspaceContainer, ContentArea } from "./styles";
import Breadcrumbs from "./Breadcrumbs";
import Visualizador from "@/components/Visualizador"; // Reuse existing logic for Leaf nodes
import { Empty } from "antd";

const Workspace = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const target = selecaoTarget?.get();

    const renderContent = () => {
        if (!target) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Empty description="Selecione um ativo no inventário" />
                </div>
            );
        }

        // Future: Switch on target.tipo to show Dashboard vs DetailView
        // For now, Visualizador handles it.
        return <Visualizador />;
    };

    return (
        <WorkspaceContainer>
            <Breadcrumbs />
            <ContentArea>
                {renderContent()}
            </ContentArea>
        </WorkspaceContainer>
    );
};

export default Workspace;
