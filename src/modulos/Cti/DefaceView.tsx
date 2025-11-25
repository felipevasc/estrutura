'use client';

import React, { useEffect, useState } from 'react';
import { Table, Alert, Spin, Tag } from 'antd';
import styled from 'styled-components';
import { useStore } from '@/hooks/useStore';

const Container = styled.div`
  padding: 24px;
`;

// Definindo o tipo para os dados de deface
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
    const [data, setData] = useState<DefaceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projetoId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/v1/projetos/${projetoId}/cti/deface`);
                if (!response.ok) {
                    throw new Error('Falha ao buscar os dados.');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projetoId]);

    const columns = [
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            render: (text: string) => <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>,
        },
        {
            title: 'Domínio',
            dataIndex: ['dominio', 'endereco'],
            key: 'dominio',
        },
        {
            title: 'Fonte',
            dataIndex: 'fonte',
            key: 'fonte',
            render: (fonte: string) => <Tag color="blue">{fonte}</Tag>,
        },
        {
            title: 'Data da Descoberta',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => new Date(text).toLocaleString(),
        },
    ];

    if (loading) {
        return <Spin tip="Carregando..." />;
    }

    if (error) {
        return <Alert message="Erro" description={error} type="error" showIcon />;
    }

    return (
        <Container>
            <Table
                dataSource={data}
                columns={columns}
                rowKey="id"
                bordered
                title={() => 'Resultados da Verificação de Deface'}
            />
        </Container>
    );
};

export default DefaceView;
