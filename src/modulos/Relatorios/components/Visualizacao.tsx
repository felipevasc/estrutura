import { Tabs, Table } from "antd";
import { AreaVisualizacao as Container, ChartContainer } from "../styles";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { ItemRelatorio } from "@/types/Relatorio";

interface VisualizacaoProps {
    chartData: { name: string, value: number }[];
    tableData: ItemRelatorio[];
    groupBy: string;
}

export function Visualizacao({ chartData, tableData }: VisualizacaoProps) {
    const columns = [
        { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 100 },
        { title: 'Valor', dataIndex: 'valor', key: 'valor', width: 250, ellipsis: true },
        { title: 'Domínio', dataIndex: 'dominio', key: 'dominio', ellipsis: true },
        { title: 'IP', dataIndex: 'ip', key: 'ip', width: 140 },
        { title: 'Porta', dataIndex: 'porta', key: 'porta', width: 80 },
        { title: 'Status', dataIndex: 'status', key: 'status', width: 80 },
        { title: 'Serviço', dataIndex: 'servico', key: 'servico', width: 100 },
    ];

    return (
        <Container>
            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: 'Gráfico',
                    children: (
                        <ChartContainer>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#555" />
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} fontSize={12} stroke="#ccc" />
                                        <YAxis stroke="#ccc" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff' }}
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                        />
                                        <Bar dataKey="value" fill="#1890ff" radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1890ff' : '#40a9ff'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ color: '#aaa', textAlign: 'center', marginTop: 50 }}>Sem dados para exibir</div>
                            )}
                        </ChartContainer>
                    )
                },
                {
                    key: '2',
                    label: 'Dados Detalhados',
                    children: (
                        <div style={{ height: '100%', overflow: 'hidden' }}>
                            <Table
                                dataSource={tableData}
                                columns={columns}
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
