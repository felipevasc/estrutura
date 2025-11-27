import { DatePicker, InputNumber, Select, Typography, Tag } from "antd";
import { PainelControle as Container, GradeResumo, CartaoResumo, TituloCartao, ValorCartao, TagSituacao, BlocoControle, GradeCampos } from "../styles";
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
    resumo: { totalRegistros: number; totalFiltrados: number; totalTipos: number; contexto: string; };
}

export function PainelControle({ relatorios, relatorioSelecionado, setRelatorioSelecionado, relatorioAtual, filtroTipo, setFiltroTipo, agrupamentoTemporal, setAgrupamentoTemporal, limiteTop, setLimiteTop, ordenacao, setOrdenacao, intervaloDatas, setIntervaloDatas, resumo }: PainelControleProps) {
    return (
        <Container>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Title level={4} style={{ margin: 0, color: '#fff' }}>Relatórios</Title>
                <TagSituacao>{relatorioAtual.titulo}</TagSituacao>
                <Text style={{ color: '#ccc' }}>{relatorioAtual.descricao}</Text>
            </div>

            <GradeResumo>
                <CartaoResumo>
                    <TituloCartao>Total de registros</TituloCartao>
                    <ValorCartao>{resumo.totalRegistros.toLocaleString('pt-BR')}</ValorCartao>
                </CartaoResumo>
                <CartaoResumo>
                    <TituloCartao>Após filtros</TituloCartao>
                    <ValorCartao>{resumo.totalFiltrados.toLocaleString('pt-BR')}</ValorCartao>
                </CartaoResumo>
                <CartaoResumo>
                    <TituloCartao>Tipos distintos</TituloCartao>
                    <ValorCartao>{resumo.totalTipos}</ValorCartao>
                </CartaoResumo>
                <CartaoResumo>
                    <TituloCartao>Contexto ativo</TituloCartao>
                    <ValorCartao>{resumo.contexto}</ValorCartao>
                </CartaoResumo>
            </GradeResumo>

            <BlocoControle>
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
            </BlocoControle>

            <BlocoControle>
                <Text strong style={{ color: '#ccc' }}>Filtros principais</Text>
                <GradeCampos>
                    <DatePicker.RangePicker
                        value={intervaloDatas}
                        onChange={(val) => setIntervaloDatas(val as [Dayjs | null, Dayjs | null])}
                        style={{ width: '100%' }}
                    />
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
                </GradeCampos>
            </BlocoControle>

            <BlocoControle>
                <Text strong style={{ color: '#ccc' }}>Prioridade e limites</Text>
                <GradeCampos>
                    <InputNumber min={3} max={30} value={limiteTop} onChange={(v) => setLimiteTop(v ?? limiteTop)} style={{ width: '100%' }} />
                    <Select
                        value={ordenacao}
                        onChange={setOrdenacao}
                        style={{ width: '100%' }}
                        options={[
                            { label: 'Maior primeiro', value: 'desc' },
                            { label: 'Menor primeiro', value: 'asc' },
                        ]}
                    />
                </GradeCampos>
                <TagSituacao>{resumo.contexto}</TagSituacao>
            </BlocoControle>
        </Container>
    );
}
