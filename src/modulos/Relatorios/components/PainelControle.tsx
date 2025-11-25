import { Select, Typography } from "antd";
import { PainelControle as Container } from "../styles";
import { ItemRelatorio } from "@/types/Relatorio";

const { Title, Text } = Typography;

interface PainelControleProps {
    groupBy: keyof ItemRelatorio;
    setGroupBy: (val: keyof ItemRelatorio) => void;
    filterType: string;
    setFilterType: (val: string) => void;
}

export function PainelControle({ groupBy, setGroupBy, filterType, setFilterType }: PainelControleProps) {
    return (
        <Container>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>Configuração</Title>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <Text strong style={{ color: '#ccc' }}>Filtrar Tipo</Text>
                <Select
                    value={filterType}
                    onChange={setFilterType}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <Text strong style={{ color: '#ccc' }}>Agrupar Por</Text>
                <Select
                    value={groupBy}
                    onChange={setGroupBy}
                    style={{ width: '100%' }}
                    options={[
                        { label: 'Tipo', value: 'tipo' },
                        { label: 'Domínio (Contexto)', value: 'dominio' },
                        { label: 'IP (Contexto)', value: 'ip' },
                        { label: 'Serviço', value: 'servico' },
                        { label: 'Status Code', value: 'status' },
                        { label: 'Porta', value: 'porta' },
                    ]}
                />
            </div>
        </Container>
    );
}
