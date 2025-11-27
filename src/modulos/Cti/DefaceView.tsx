'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Alert, Tag, Button, Select, message, Card, Space, Typography, Row, Col, Popconfirm, Modal, Input, Spin } from 'antd';
import styled from 'styled-components';
import { useStore } from '@/hooks/useStore';
import { Dominio } from '@prisma/client';
import { SettingOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TabelaContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
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
    const [executing, setExecuting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Configuration State
    const [dorkCategories, setDorkCategories] = useState<string[]>([]);
    const [configModalVisible, setConfigModalVisible] = useState(false);
    const [currentConfigCategory, setCurrentConfigCategory] = useState<string | null>(null);
    const [currentConfigList, setCurrentConfigList] = useState<string>("");
    const [savingConfig, setSavingConfig] = useState(false);

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

    const fetchDorkConfig = useCallback(async () => {
        try {
            const response = await fetch('/api/v1/configuracoes/dorks');
            if (response.ok) {
                const config = await response.json();
                setDorkCategories(Object.keys(config));
            }
        } catch (err) {
            console.error("Failed to load dork config", err);
        }
    }, []);

    useEffect(() => {
        fetchDominios();
        fetchData();
        fetchDorkConfig();
    }, [fetchDominios, fetchData, fetchDorkConfig]);

    const handleExecute = async (category: string) => {
        if (!selectedDominio) {
            message.warning('Por favor, selecione um domínio alvo.');
            return;
        }
        setExecuting(category);
        try {
            const response = await fetch(`/api/v1/projetos/${projetoId}/cti/deface/executar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dominioId: selectedDominio, ferramenta: category }),
            });
            if (!response.ok) throw new Error('Falha ao enfileirar a tarefa.');
            message.success(`Tarefa 'Dork [${category}]' enfileirada!`);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Erro desconhecido.');
        } finally {
            setExecuting(null);
        }
    };

    const handleLimpar = async () => {
        if (!projetoId) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/projetos/${projetoId}/cti/deface`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao limpar os dados.');
            }
            message.success("Dados de deface limpos com sucesso.");
            setData([]);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setLoading(false);
        }
    };

    const openConfigModal = async (category: string) => {
        setCurrentConfigCategory(category);
        setSavingConfig(true);
        try {
            const response = await fetch('/api/v1/configuracoes/dorks');
            const config = await response.json();
            const list = config[category] || [];
            setCurrentConfigList(list.join('\n'));
            setConfigModalVisible(true);
        } catch (err) {
            message.error("Erro ao carregar configuração.");
        } finally {
            setSavingConfig(false);
        }
    };

    const saveConfig = async () => {
        if (!currentConfigCategory) return;
        setSavingConfig(true);
        try {
            // Fetch current full config first
            const getResponse = await fetch('/api/v1/configuracoes/dorks');
            const currentConfig = await getResponse.json();

            // Update specific category
            const newList = currentConfigList.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            currentConfig[currentConfigCategory] = newList;

            const postResponse = await fetch('/api/v1/configuracoes/dorks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentConfig)
            });

            if (!postResponse.ok) throw new Error("Falha ao salvar");
            message.success("Configuração atualizada com sucesso.");
            setConfigModalVisible(false);
            fetchDorkConfig(); // Refresh categories if needed (though unlikely to change keys here)
        } catch (err) {
            message.error("Erro ao salvar configuração.");
        } finally {
            setSavingConfig(false);
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
            <Row gutter={24} style={{ height: '100%', display: 'flex' }}>
                <Col span={18} style={{ display: 'flex', flexDirection: 'column' }}>
                    <Card style={{ marginBottom: 24, flexShrink: 0 }}>
                        <Title level={5}>Alvo</Title>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Selecione um domínio"
                            onChange={(value) => setSelectedDominio(value)}
                            allowClear
                            disabled={!projetoId}
                        >
                            {dominios.map(d => <Option key={d.id} value={d.id}>{d.endereco}</Option>)}
                        </Select>
                    </Card>
                    <TabelaContainer>
                        <Table
                            dataSource={data}
                            columns={columns}
                            rowKey="id"
                            bordered
                            loading={loading}
                            title={() => (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Resultados da Verificação de Deface</span>
                                    <Space>
                                        <Button onClick={() => fetchData()} type="primary">Atualizar Resultados</Button>
                                        <Popconfirm
                                            title="Limpar todos os dados?"
                                            description="Esta ação é irreversível. Deseja continuar?"
                                            onConfirm={handleLimpar}
                                            okText="Sim"
                                            cancelText="Não"
                                        >
                                            <Button danger>Limpar</Button>
                                        </Popconfirm>
                                    </Space>
                                </div>
                            )}
                        />
                    </TabelaContainer>
                </Col>
                <Col span={6}>
                    <Card title="Ferramentas (Dorks)" style={{ height: '100%', overflowY: 'auto' }}>
                         <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                            Execute buscas agrupadas por categoria.
                        </Text>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {dorkCategories.length === 0 && <Spin />}
                            {dorkCategories.map(category => (
                                <div key={category} style={{ display: 'flex', gap: 8 }}>
                                    <Button
                                        block
                                        onClick={() => handleExecute(category)}
                                        loading={executing === category}
                                        disabled={!!executing}
                                    >
                                        Dork [{category.charAt(0).toUpperCase() + category.slice(1)}]
                                    </Button>
                                    <Button
                                        icon={<SettingOutlined />}
                                        onClick={() => openConfigModal(category)}
                                    />
                                </div>
                            ))}
                        </Space>
                    </Card>
                </Col>
            </Row>
            {error && <Alert message="Erro" description={error} type="error" showIcon style={{ marginTop: 16 }} />}

            <Modal
                title={`Configurar Dorks: ${currentConfigCategory}`}
                open={configModalVisible}
                onOk={saveConfig}
                onCancel={() => setConfigModalVisible(false)}
                confirmLoading={savingConfig}
            >
                <Alert message="Insira uma frase/palavra por linha." type="info" style={{ marginBottom: 16 }} />
                <TextArea
                    rows={10}
                    value={currentConfigList}
                    onChange={(e) => setCurrentConfigList(e.target.value)}
                />
            </Modal>
        </Container>
    );
};

export default DefaceView;
