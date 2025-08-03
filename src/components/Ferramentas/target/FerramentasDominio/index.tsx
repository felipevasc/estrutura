import { CaretRightOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { StyledFerramentasDominio } from "./styles";

const gridStyle: React.CSSProperties = {
  width: '100%',
  textAlign: 'center',
};

const FerramentasDominio = () => {
    return <StyledFerramentasDominio>
        <Card
            title={"Amass"}
        >
            <Card.Meta description={"Enumeração de subdomínios e descoberta de assets."} />
        </Card>
        <Card
            title={"Subfinder"}
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