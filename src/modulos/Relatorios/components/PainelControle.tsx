import { DatePicker, InputNumber, Select, Typography, Divider, Tag } from "antd";
import { PainelControle as Container } from "../styles";
import { ConfiguracaoRelatorio } from "@/types/Relatorio";
import { Dayjs } from "dayjs";

const { Title, Text } = Typography;

interface PainelControleProps {
    relatorios: ConfiguracaoRelatorio[];
    relatorioSelecionado: string;
    setRelatorioSelecionado: (val: string) => void;
    relatorioAtual: ConfiguracaoRelatorio;
    filtroTipo: string;
    setFiltroTipo: (val: string) => void;
    agrupamentoTemporal: 'mes' | 'semana' | 'dia';
    setAgrupamentoTemporal: (val: 'mes' | 'semana' | 'dia') => void;
    limiteTop: number;
    setLimiteTop: (val: number) => void;
    ordenacao: 'asc' | 'desc';
    setOrdenacao: (val: 'asc' | 'desc') => void;
    intervaloDatas: [Dayjs | null, Dayjs | null];
    setIntervaloDatas: (val: [Dayjs | null, Dayjs | null]) => void;
}

export function PainelControle({ relatorios, relatorioSelecionado, setRelatorioSelecionado, relatorioAtual, filtroTipo, setFiltroTipo, agrupamentoTemporal, setAgrupamentoTemporal, limiteTop, setLimiteTop, ordenacao, setOrdenacao, intervaloDatas, setIntervaloDatas }: PainelControleProps) {
    return (
        <Container>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Title level={4} style={{ margin: 0, color: '#fff' }}>Relatórios</Title>
                <Text style={{ color: '#ccc' }}>{relatorioAtual.descricao}</Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Text strong style={{ color: '#ccc' }}>Escolha o relatório</Text>
                <Select
                    value={relatorioSelecionado}
                    onChange={setRelatorioSelecionado}
                    style={{ width: '100%' }}
                    options={relatorios.map(r => ({ label: r.titulo, value: r.chave }))}
                />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {relatorios.slice(0, 4).map(item => (
                        <Tag key={item.chave} color={item.chave === relatorioSelecionado ? 'geekblue' : 'default'}>{item.titulo}</Tag>
                    ))}
                </div>
            </div>

            <Divider style={{ borderColor: '#333' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Text strong style={{ color: '#ccc' }}>Filtro de período</Text>
                <DatePicker.RangePicker
                    value={intervaloDatas}
                    onChange={(val) => setIntervaloDatas(val as [Dayjs | null, Dayjs | null])}
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Text strong style={{ color: '#ccc' }}>Tipo de dado</Text>
                <Select
                    value={filtroTipo}
                    onChange={setFiltroTipo}
                    style={{ width: '100%' }}
                    options={[
                        { label: 'Todos', value: 'todos' },
                        { label: 'Domínios', value: 'Dominio' },
                        { label: 'IPs', value: 'IP' },
                        { label: 'Portas', value: 'Porta' },
                        { label: 'Diretórios', value: 'Diretorio' },
                    ]}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Text strong style={{ color: '#ccc' }}>Agrupamento temporal</Text>
                <Select
                    value={agrupamentoTemporal}
                    onChange={setAgrupamentoTemporal}
                    style={{ width: '100%' }}
                    options={[
                        { label: 'Mês', value: 'mes' },
                        { label: 'Semana', value: 'semana' },
                        { label: 'Dia', value: 'dia' },
                    ]}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Text strong style={{ color: '#ccc' }}>Limite de itens</Text>
                    <InputNumber min={3} max={30} value={limiteTop} onChange={(v) => setLimiteTop(v ?? limiteTop)} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Text strong style={{ color: '#ccc' }}>Ordenação</Text>
                    <Select
                        value={ordenacao}
                        onChange={setOrdenacao}
                        style={{ width: '100%' }}
                        options={[
                            { label: 'Maior primeiro', value: 'desc' },
                            { label: 'Menor primeiro', value: 'asc' },
                        ]}
                    />
                </div>
            </div>
        </Container>
    );
}
