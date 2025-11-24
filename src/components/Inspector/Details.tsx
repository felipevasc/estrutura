import { useContext } from "react";
import StoreContext from "@/store";
import { InspectorBody, PropertyGroup, PropertyLabel, PropertyValue } from "./styles";
import { Empty } from "antd";

const InspectorDetails = () => {
    const { selecaoTarget } = useContext(StoreContext);
    const target = selecaoTarget?.get();

    if (!target) {
        return (
            <InspectorBody>
                <Empty description="Nenhum item selecionado" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </InspectorBody>
        );
    }

    // Mock properties - in a real scenario, we might fetch these or have them in the store
    const renderProperties = () => {
        switch (target.tipo) {
            case "domain":
                return (
                    <>
                        <PropertyGroup>
                            <PropertyLabel>Domínio</PropertyLabel>
                            <PropertyValue>{target.valor}</PropertyValue>
                        </PropertyGroup>
                        <PropertyGroup>
                            <PropertyLabel>ID</PropertyLabel>
                            <PropertyValue>{target.id}</PropertyValue>
                        </PropertyGroup>
                        <PropertyGroup>
                            <PropertyLabel>Status</PropertyLabel>
                            <PropertyValue>Ativo</PropertyValue>
                        </PropertyGroup>
                    </>
                );
            case "ip":
                return (
                    <>
                        <PropertyGroup>
                            <PropertyLabel>Endereço IP</PropertyLabel>
                            <PropertyValue>{target.valor}</PropertyValue>
                        </PropertyGroup>
                        <PropertyGroup>
                            <PropertyLabel>ID</PropertyLabel>
                            <PropertyValue>{target.id}</PropertyValue>
                        </PropertyGroup>
                        <PropertyGroup>
                            <PropertyLabel>Localização</PropertyLabel>
                            <PropertyValue>Desconhecida</PropertyValue>
                        </PropertyGroup>
                    </>
                );
             case "service":
                return (
                    <>
                         <PropertyGroup>
                            <PropertyLabel>Serviço</PropertyLabel>
                            <PropertyValue>{target.valor}</PropertyValue>
                        </PropertyGroup>
                        <PropertyGroup>
                            <PropertyLabel>Porta</PropertyLabel>
                            <PropertyValue>{target.parentId}</PropertyValue> {/* Assuming parentId might hold port info contextually or we need to fetch it */}
                        </PropertyGroup>
                    </>
                );
            default:
                return (
                    <>
                        <PropertyGroup>
                            <PropertyLabel>Nome</PropertyLabel>
                            <PropertyValue>{target.valor || "N/A"}</PropertyValue>
                        </PropertyGroup>
                        <PropertyGroup>
                            <PropertyLabel>Tipo</PropertyLabel>
                            <PropertyValue>{target.tipo}</PropertyValue>
                        </PropertyGroup>
                    </>
                );
        }
    };

    return (
        <InspectorBody>
            {renderProperties()}
        </InspectorBody>
    );
};

export default InspectorDetails;
