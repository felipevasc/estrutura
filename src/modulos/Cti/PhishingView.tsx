'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button, Table, Typography, Space, Select, Tag, message, Modal, Divider, Tooltip, Alert, Badge, Skeleton } from 'antd';
import styled from 'styled-components';
import { useStore } from '@/hooks/useStore';
import { Dominio } from '@prisma/client';
import { RadarChartOutlined, ReloadOutlined, SettingOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 0;
  width: 100%;
`;

const Grade = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(360px, 1fr);
  gap: 16px;
`;

const Cartao = styled.div`
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borders.radius};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Cabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const BlocoTitulo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Selo = styled(Tag)`
  margin: 0;
  border-radius: 999px;
  padding: 4px 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
`;

const BarraControle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const PainelFerramenta = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borders.radius};
  background: ${({ theme }) => theme.glass.default};
`;

const IconeFerramenta = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}22, ${({ theme }) => theme.colors.primary}55);
  color: ${({ theme }) => theme.colors.primary};
  font-size: 26px;
`;

const AcoesFerramenta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const ListaTermos = styled.div`
  max-height: 280px;
  overflow: auto;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borders.radius};
  background: ${({ theme }) => theme.glass.card};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
`;

interface RegistroPhishing {
    id: number;
    alvo: string;
    termo: string;
    fonte: string;
    criadoEm: string;
    dominio: { endereco: string };
}

const formatarData = (valor: string) => new Date(valor).toLocaleString('pt-BR');

const PhishingView = () => {
    const { projeto } = useStore();
    const projetoId = projeto?.get()?.id;
    const [dominios, setDominios] = useState<Dominio[]>([]);
    const [dominioSelecionado, setDominioSelecionado] = useState<number | null>(null);
    const [dados, setDados] = useState<RegistroPhishing[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [executando, setExecutando] = useState(false);
    const [modalTermosVisivel, setModalTermosVisivel] = useState(false);
    const [termos, setTermos] = useState<string[]>([]);
    const [entradaTermos, setEntradaTermos] = useState<string[]>([]);
    const [carregandoTermos, setCarregandoTermos] = useState(false);
    const [salvandoTermos, setSalvandoTermos] = useState(false);

    const buscarDominios = useCallback(async () => {
        if (!projetoId) return;
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/dominios`);
            const lista = await resposta.json();
            setDominios(lista);
        } catch {
            message.error('Falha ao carregar domínios.');
        }
    }, [projetoId]);

    const buscarDados = useCallback(async () => {
        if (!projetoId) return;
        setCarregando(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing`);
            if (!resposta.ok) throw new Error();
            const resultado = await resposta.json();
            setDados(resultado);
        } catch {
            message.error('Erro ao carregar registros de phishing.');
        } finally {
            setCarregando(false);
        }
    }, [projetoId]);

    useEffect(() => {
        buscarDominios();
        buscarDados();
    }, [buscarDominios, buscarDados]);

    const carregarTermos = useCallback(async (dominioId: number) => {
        if (!projetoId) return;
        setCarregandoTermos(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/termos?dominioId=${dominioId}`);
            if (!resposta.ok) throw new Error();
            const lista = await resposta.json();
            setTermos(lista);
            setEntradaTermos(lista);
        } catch {
            message.error('Não foi possível carregar os termos.');
        } finally {
            setCarregandoTermos(false);
        }
    }, [projetoId]);

    const abrirModalTermos = async () => {
        if (!dominioSelecionado) {
            message.warning('Selecione um domínio para configurar.');
            return;
        }
        setModalTermosVisivel(true);
        await carregarTermos(dominioSelecionado);
    };

    const salvarTermos = async () => {
        if (!dominioSelecionado || !projetoId) return;
        setSalvandoTermos(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/termos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dominioId: dominioSelecionado, termos: entradaTermos }),
            });
            if (!resposta.ok) throw new Error();
            const { termos: termosSalvos } = await resposta.json();
            setTermos(termosSalvos);
            setModalTermosVisivel(false);
            message.success('Termos atualizados.');
        } catch {
            message.error('Erro ao salvar termos.');
        } finally {
            setSalvandoTermos(false);
        }
    };

    const executarDnstwist = async () => {
        if (!dominioSelecionado || !projetoId) {
            message.warning('Escolha um domínio alvo.');
            return;
        }
        if (!termos.length) await carregarTermos(dominioSelecionado);
        setExecutando(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/executar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dominioId: dominioSelecionado })
            });
            if (!resposta.ok) throw new Error();
            message.success('Busca enfileirada. Acompanhe os resultados na tabela.');
        } catch {
            message.error('Não foi possível iniciar a varredura.');
        } finally {
            setExecutando(false);
        }
    };

    const limparDados = async () => {
        if (!projetoId) return;
        setCarregando(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing`, { method: 'DELETE' });
            if (!resposta.ok) throw new Error();
            setDados([]);
            message.success('Dados removidos.');
        } catch {
            message.error('Erro ao limpar dados.');
        } finally {
            setCarregando(false);
        }
    };

    const colunas = [
        {
            title: 'Host identificado',
            dataIndex: 'alvo',
            key: 'alvo',
            render: (valor: string) => <a href={`http://${valor}`} target="_blank" rel="noreferrer">{valor}</a>,
        },
        {
            title: 'Termo',
            dataIndex: 'termo',
            key: 'termo',
            render: (valor: string) => <Tag color="purple">{valor}</Tag>
        },
        {
            title: 'Fonte',
            dataIndex: 'fonte',
            key: 'fonte',
            render: (valor: string) => <Tag color="blue">{valor.toUpperCase()}</Tag>
        },
        {
            title: 'Domínio',
            dataIndex: ['dominio', 'endereco'],
            key: 'dominio',
        },
        {
            title: 'Detectado em',
            dataIndex: 'criadoEm',
            key: 'criadoEm',
            render: (valor: string) => formatarData(valor)
        }
    ];

    return (
        <Container>
            <Grade>
                <Cartao>
                    <Cabecalho>
                        <BlocoTitulo>
                            <Selo color="purple">PHISHING</Selo>
                            <Title level={4} style={{ margin: 0 }}>Radar anti-phishing</Title>
                            <Text type="secondary">Visualize hosts suspeitos e acompanhe novas descobertas.</Text>
                        </BlocoTitulo>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={buscarDados} loading={carregando}>Atualizar</Button>
                            <Button danger onClick={limparDados} disabled={carregando}>Limpar</Button>
                        </Space>
                    </Cabecalho>
                    <BarraControle>
                        <div style={{ minWidth: 140 }}>
                            <Text type="secondary">Domínio alvo</Text>
                        </div>
                        <Select
                            style={{ flex: 1 }}
                            placeholder="Escolha o domínio"
                            onChange={(valor) => {
                                setDominioSelecionado(valor ?? null);
                                if (valor) {
                                    carregarTermos(valor);
                                } else {
                                    setTermos([]);
                                    setEntradaTermos([]);
                                }
                            }}
                            value={dominioSelecionado ?? undefined}
                            allowClear
                        >
                            {dominios.map(dominio => <Option key={dominio.id} value={dominio.id}>{dominio.endereco}</Option>)}
                        </Select>
                        <Tooltip title="Recarregar domínios">
                            <Button icon={<RadarChartOutlined />} onClick={buscarDominios} />
                        </Tooltip>
                        <Badge count={dados.length} showZero color="#722ed1">
                            <Button type="primary" icon={<ReloadOutlined />} onClick={buscarDados} loading={carregando}>
                                Atualizar lista
                            </Button>
                        </Badge>
                    </BarraControle>
                    <Table
                        dataSource={dados}
                        columns={colunas}
                        rowKey="id"
                        loading={carregando}
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: true }}
                    />
                </Cartao>

                <Cartao>
                    <Cabecalho>
                        <BlocoTitulo>
                            <Selo color="blue">FERRAMENTAS</Selo>
                            <Title level={5} style={{ margin: 0 }}>Detecção ativa</Title>
                        </BlocoTitulo>
                        <Space>
                            <Button icon={<SettingOutlined />} onClick={abrirModalTermos}>Configurar termos</Button>
                        </Space>
                    </Cabecalho>
                    <PainelFerramenta>
                        <IconeFerramenta>
                            <ThunderboltOutlined />
                        </IconeFerramenta>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                <div>
                                    <Text strong>dnstwist</Text>
                                    <div><Text type="secondary">Gera domínios lookalike e valida os ativos.</Text></div>
                                </div>
                                <Tag color="geekblue">Dinâmico</Tag>
                            </div>
                            <AcoesFerramenta>
                                <Button onClick={abrirModalTermos} icon={<SettingOutlined />}>
                                    Termos ({termos.length || '-'})
                                </Button>
                                <Button type="primary" icon={<RadarChartOutlined />} loading={executando} onClick={executarDnstwist}>
                                    Varredura completa
                                </Button>
                            </AcoesFerramenta>
                        </div>
                    </PainelFerramenta>
                    <Alert
                        message="Dicas"
                        description="Personalize os termos antes de rodar para cobrir variações de marca, departamentos e iscas comuns."
                        type="info"
                        showIcon
                    />
                </Cartao>
            </Grade>

            <Modal
                title="Termos de busca"
                open={modalTermosVisivel}
                onOk={salvarTermos}
                okText="Salvar termos"
                onCancel={() => setModalTermosVisivel(false)}
                confirmLoading={salvandoTermos}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text type="secondary">Edite ou adicione termos utilizados pelo dnstwist.</Text>
                    {carregandoTermos ? (
                        <Skeleton active paragraph={{ rows: 4 }} />
                    ) : (
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            value={entradaTermos}
                            onChange={valor => setEntradaTermos(valor)}
                            tokenSeparators={[',', ' ']}
                            placeholder="Insira termos e pressione enter"
                        />
                    )}
                    <Divider style={{ margin: '8px 0' }} />
                    <Text strong>Pré-visualização</Text>
                    {carregandoTermos ? <Skeleton active paragraph={{ rows: 3 }} /> : (
                        <ListaTermos>
                            {entradaTermos.map((termo) => <Tag key={termo} color="purple">{termo}</Tag>)}
                            {!entradaTermos.length && <Text type="secondary">Nenhum termo definido.</Text>}
                        </ListaTermos>
                    )}
                </Space>
            </Modal>
        </Container>
    );
};

export default PhishingView;
