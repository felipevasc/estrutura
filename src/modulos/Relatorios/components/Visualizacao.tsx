import { Tabs, Table, Typography, Empty } from "antd";
import { AreaVisualizacao as Container, ChartContainer, CabecalhoVisualizacao, DescricaoRelatorio } from "../styles";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, PieChart, Pie, AreaChart, Area, Legend } from 'recharts';
import { ConfiguracaoRelatorio, ResultadoRelatorio } from "@/types/Relatorio";

const { Title, Text } = Typography;

interface VisualizacaoProps {
    relatorio: ConfiguracaoRelatorio;
    resultado: ResultadoRelatorio;
}

const cores = ['#1890ff', '#40a9ff', '#13c2c2', '#52c41a', '#fadb14', '#fa8c16', '#f759ab', '#9254de'];

export function Visualizacao({ relatorio, resultado }: VisualizacaoProps) {
    const colunas = [
        { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 120 },
        { title: 'Valor', dataIndex: 'valor', key: 'valor', width: 260, ellipsis: true },
        { title: 'Domínio', dataIndex: 'dominio', key: 'dominio', ellipsis: true },
        { title: 'IP', dataIndex: 'ip', key: 'ip', width: 140 },
        { title: 'Porta', dataIndex: 'porta', key: 'porta', width: 80 },
        { title: 'Status', dataIndex: 'status', key: 'status', width: 80 },
        { title: 'Serviço', dataIndex: 'servico', key: 'servico', width: 120 },
    ];

    const renderizarGrafico = () => {
        if (resultado.dadosGrafico.length === 0) return <Empty description="Sem dados para exibir" style={{ marginTop: 60 }} />;
        if (resultado.tipoGrafico === 'linha') {
            return (
                <ResponsiveContainer width="100%" height="100%" minHeight={420}>
                    <LineChart data={resultado.dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#555" />
                        <XAxis dataKey="nome" angle={-30} textAnchor="end" height={60} interval={0} fontSize={12} stroke="#ccc" label={resultado.eixoX ? { value: resultado.eixoX, position: 'insideBottom', offset: -20, fill: '#ccc' } : undefined} />
                        <YAxis stroke="#ccc" label={resultado.eixoY ? { value: resultado.eixoY, angle: -90, position: 'insideLeft', fill: '#ccc' } : undefined} />
                        <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff' }} />
                        <Line type="monotone" dataKey="valor" stroke="#40a9ff" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            );
        }

        if (resultado.tipoGrafico === 'pizza') {
            return (
                <ResponsiveContainer width="100%" height="100%" minHeight={420}>
                    <PieChart>
                        <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff' }} />
                        <Legend verticalAlign="bottom" height={50} />
                        <Pie data={resultado.dadosGrafico} dataKey="valor" nameKey="nome" innerRadius={60} outerRadius={110} paddingAngle={3}>
                            {resultado.dadosGrafico.map((_, index) => (
                                <Cell key={index} fill={cores[index % cores.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            );
        }

        if (resultado.tipoGrafico === 'area') {
            return (
                <ResponsiveContainer width="100%" height="100%" minHeight={420}>
                    <AreaChart data={resultado.dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#555" />
                        <XAxis dataKey="nome" angle={-25} textAnchor="end" height={60} interval={0} fontSize={12} stroke="#ccc" label={resultado.eixoX ? { value: resultado.eixoX, position: 'insideBottom', offset: -20, fill: '#ccc' } : undefined} />
                        <YAxis stroke="#ccc" label={resultado.eixoY ? { value: resultado.eixoY, angle: -90, position: 'insideLeft', fill: '#ccc' } : undefined} />
                        <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff' }} />
                        <Area type="monotone" dataKey="valor" stroke="#13c2c2" fill="#13c2c2" fillOpacity={0.35} strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            );
        }

        return (
            <ResponsiveContainer width="100%" height="100%" minHeight={420}>
                <BarChart data={resultado.dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#555" />
                    <XAxis dataKey="nome" angle={-40} textAnchor="end" height={70} interval={0} fontSize={12} stroke="#ccc" label={resultado.eixoX ? { value: resultado.eixoX, position: 'insideBottom', offset: -30, fill: '#ccc' } : undefined} />
                    <YAxis stroke="#ccc" label={resultado.eixoY ? { value: resultado.eixoY, angle: -90, position: 'insideLeft', fill: '#ccc' } : undefined} />
                    <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff' }} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                    <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                        {resultado.dadosGrafico.map((_, index) => (
                            <Cell key={index} fill={cores[index % cores.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <Container>
            <CabecalhoVisualizacao>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Title level={4} style={{ margin: 0, color: '#fff' }}>{relatorio.titulo}</Title>
                    <DescricaoRelatorio>{relatorio.descricao}</DescricaoRelatorio>
                </div>
                {resultado.destaque && <Text style={{ color: '#fff', fontWeight: 700 }}>{resultado.destaque}</Text>}
            </CabecalhoVisualizacao>
            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: 'Visualização',
                    children: (
                        <ChartContainer>
                            {renderizarGrafico()}
                        </ChartContainer>
                    )
                },
                {
                    key: '2',
                    label: 'Dados Detalhados',
                    children: (
                        <div style={{ height: '100%', overflow: 'hidden' }}>
                            <Table
                                dataSource={resultado.dadosTabela}
                                columns={colunas}
                                rowKey="id"
                                size="small"
                                pagination={{ pageSize: 50 }}
                                scroll={{ y: 500 }}
                            />
                        </div>
                    )
                }
            ]} />
        </Container>
    );
}
