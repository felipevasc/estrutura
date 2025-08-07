import { CaretRightOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { StyledFerramentasDominio } from "./styles";
import useApi from "@/api";
import { useContext } from "react";
import StoreContext from "@/store";

const gridStyle: React.CSSProperties = {
    width: '100%',
    textAlign: 'center',
};

const FerramentasDominio = () => {
    const api = useApi();
    const { selecaoTarget } = useContext(StoreContext);

    const execAmass = () => {
        if (selecaoTarget?.get()?.tipo === "domain") {
            api.ferramentas.executeAmass(selecaoTarget.get()?.id ?? 0);
        }
    }
    const execSubfinder = () => {
        if (selecaoTarget?.get()?.tipo === "domain") {
            api.ferramentas.executeSubfinder(selecaoTarget.get()?.id ?? 0);
        }
    }


    return <StyledFerramentasDominio>
        <Card
            title={"Amass"}
            onClick={execAmass}
        >
            <Card.Meta description={"Enumeração de subdomínios e descoberta de assets."} />
        </Card>
        <Card
            title={"Subfinder"}
            onClick={execSubfinder}
        >
            <Card.Meta description={"Descoberta de subdomínios passivos."} />
        </Card>
        <Card
            title={"Findomain"}
        >
            <Card.Meta description={"Monitoramento e descoberta de subdomínios."} />
        </Card>
    </StyledFerramentasDominio>
}

export default FerramentasDominio;