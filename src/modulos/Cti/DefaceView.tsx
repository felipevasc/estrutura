'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Alert, Tag, Button, Select, message, Card, Space, Typography, Row, Col } from 'antd';
import styled from 'styled-components';
import { useStore } from '@/hooks/useStore';
import { Dominio } from '@prisma/client';

const { Option } = Select;
const { Title } = Typography;

const Container = styled.div`
  height: 100%;
`;

interface DefaceRecord {
    id: number;
    url: string;
    fonte: string;
    createdAt: string;
    dominio: {
        endereco: string;
    };
}

const DefaceView = () => {
    const { projeto } = useStore();
    const projetoId = projeto?.get()?.id;
    const [dominios, setDominios] = useState<Dominio[]>([]);
    const [selectedDominio, setSelectedDominio] = useState<number | null>(null);
    const [data, setData] = useState<DefaceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDominios = useCallback(async () => {
        if (!projetoId) return;
        try {
            const response = await fetch(`/api/v1/projetos/${projetoId}/dominios`);
            const result = await response.json();
            setDominios(result);
        } catch (err) {
            message.error("Falha ao carregar a lista de domínios.");
        }
    }, [projetoId]);

    const fetchData = useCallback(async () => {
        if (!projetoId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/v1/projetos/${projetoId}/cti/deface`);
            if (!response.ok) throw new Error('Falha ao buscar os dados.');
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setLoading(false);
        }
    }, [projetoId]);

    useEffect(() => {
        fetchDominios();
        fetchData();
    }, [fetchDominios, fetchData]);

    const handleExecute = async (ferramenta: 'hackedby' | 'pwnedby') => {
        if (!selectedDominio) {
            message.warning('Por favor, selecione um domínio alvo.');
            return;
        }
        setExecuting(true);
        try {
            const response = await fetch(`/api/v1/projetos/${projetoId}/cti/deface/executar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dominioId: selectedDominio, ferramenta }),
            });
            if (!response.ok) throw new Error('Falha ao enfileirar a tarefa.');
            message.success(`Tarefa '${ferramenta}' enfileirada com sucesso! Os resultados aparecerão em breve.`);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Erro desconhecido.');
        } finally {
            setExecuting(false);
        }
    };

    const columns = [
        { title: 'URL', dataIndex: 'url', key: 'url', render: (text: string) => <a href={text} target="_blank" rel="noopener noreferrer">{text}</a> },
        { title: 'Domínio', dataIndex: ['dominio', 'endereco'], key: 'dominio' },
        { title: 'Fonte', dataIndex: 'fonte', key: 'fonte', render: (fonte: string) => <Tag color="blue">{fonte}</Tag> },
        { title: 'Data da Descoberta', dataIndex: 'createdAt', key: 'createdAt', render: (text: string) => new Date(text).toLocaleString() },
    ];

    return (
        <Container>
            <Row gutter={24}>
                <Col span={18}>
                    <Card style={{ marginBottom: 24 }}>
                        <Title level={5}>Alvo</Title>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Selecione um domínio"
                            onChange={(value) => setSelectedDominio(value)}
                            allowClear
                        >
                            {dominios.map(d => <Option key={d.id} value={d.id}>{d.endereco}</Option>)}
                        </Select>
                    </Card>
                    <Table
                        dataSource={data}
                        columns={columns}
                        rowKey="id"
                        bordered
                        loading={loading}
                        title={() => (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Resultados da Verificação de Deface</span>
                                <Button onClick={() => fetchData()} type="primary">Atualizar Resultados</Button>
                            </div>
                        )}
                    />
                </Col>
                <Col span={6}>
                    <Card>
                        <Title level={5}>Ferramentas</Title>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button
                                block
                                onClick={() => handleExecute('hackedby')}
                                loading={executing}
                            >
                                Google-HackBY
                            </Button>
                            <Button
                                block
                                onClick={() => handleExecute('pwnedby')}
                                loading={executing}
                            >
                                Google-PwnedBy
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
            {error && <Alert message="Erro" description={error} type="error" showIcon style={{ marginTop: 16 }} />}
        </Container>
    );
};

export default DefaceView;
