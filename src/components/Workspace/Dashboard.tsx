import { Card, Statistic, Row, Col } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

// Placeholder for a Dashboard view when a Root item (Project/Domain) is selected
const Dashboard = () => {
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <h2>Visão Geral do Alvo</h2>
            <Row gutter={16}>
                <Col span={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Subdomínios Ativos"
                            value={12}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Portas Abertas"
                            value={25}
                            precision={0}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Vulnerabilidades Potenciais"
                            value={3}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowDownOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <div style={{ marginTop: '20px' }}>
                <Card title="Atividade Recente">
                    <p>Scan de portas concluído em 10.0.0.1</p>
                    <p>Novo subdomínio encontrado: admin.exemplo.com</p>
                    <p>Fuzzing iniciado em api.exemplo.com</p>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
