'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button, Table, Typography, Space, Select, Tag, message, Modal, Divider, Tooltip, Alert, Badge, Skeleton, Input, InputNumber, Row, Col } from 'antd';
import styled from 'styled-components';
import { useStore } from '@/hooks/useStore';
import { Dominio } from '@prisma/client';
import { RadarChartOutlined, ReloadOutlined, SettingOutlined, ThunderboltOutlined, SafetyOutlined, InfoCircleOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

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

type PalavraCatcher = { termo: string; peso: number };

type ConfiguracaoCatcher = { palavras: PalavraCatcher[]; tlds: string[] };

const configInicial: ConfiguracaoCatcher = { palavras: [], tlds: [] };

const formatarData = (valor: string) => new Date(valor).toLocaleString('pt-BR');

const PhishingView = () => {
    const { projeto } = useStore();
    const projetoId = projeto?.get()?.id;
    const [dominios, setDominios] = useState<Dominio[]>([]);
    const [dominioSelecionado, setDominioSelecionado] = useState<number | null>(null);
    const [dados, setDados] = useState<RegistroPhishing[]>([]);
    const [termos, setTermos] = useState<string[]>([]);
    const [entradaTermos, setEntradaTermos] = useState<string[]>([]);
    const [modalTermosVisivel, setModalTermosVisivel] = useState(false);
    const [executando, setExecutando] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [carregandoTermos, setCarregandoTermos] = useState(false);
    const [salvandoTermos, setSalvandoTermos] = useState(false);
    const [configuracaoCatcher, setConfiguracaoCatcher] = useState<ConfiguracaoCatcher>(configInicial);
    const [modalConfiguracaoCatcher, setModalConfiguracaoCatcher] = useState(false);
    const [carregandoConfiguracao, setCarregandoConfiguracao] = useState(false);
    const [salvandoConfiguracao, setSalvandoConfiguracao] = useState(false);
    const [executandoCatcher, setExecutandoCatcher] = useState(false);
    const [modalAjuda, setModalAjuda] = useState<{ titulo: string; descricao: React.ReactNode } | null>(null);

    const buscarDominios = useCallback(async () => {
        if (!projetoId) return;
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/dominios`);
            if (!resposta.ok) throw new Error();
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

    const carregarConfiguracaoCatcher = useCallback(async (dominioId: number) => {
        if (!projetoId) return;
        setCarregandoConfiguracao(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/catcher/configuracao?dominioId=${dominioId}`);
            if (!resposta.ok) throw new Error();
            const configuracao = await resposta.json();
            setConfiguracaoCatcher(configuracao);
        } catch {
            message.error('Não foi possível carregar a configuração do phishing_catcher.');
        } finally {
            setCarregandoConfiguracao(false);
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

    const abrirConfiguracaoCatcher = async () => {
        if (!dominioSelecionado) {
            message.warning('Selecione um domínio para configurar.');
            return;
        }
        setModalConfiguracaoCatcher(true);
        await carregarConfiguracaoCatcher(dominioSelecionado);
    };

    const salvarConfiguracaoCatcher = async () => {
        if (!dominioSelecionado || !projetoId) return;
        setSalvandoConfiguracao(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/catcher/configuracao`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dominioId: dominioSelecionado, ...configuracaoCatcher })
            });
            if (!resposta.ok) throw new Error();
            const configuracao = await resposta.json();
            setConfiguracaoCatcher(configuracao);
            setModalConfiguracaoCatcher(false);
            message.success('Configuração salva.');
        } catch {
            message.error('Erro ao salvar a configuração do phishing_catcher.');
        } finally {
            setSalvandoConfiguracao(false);
        }
    };

    const executarPhishingCatcher = async () => {
        if (!dominioSelecionado || !projetoId) {
            message.warning('Escolha um domínio alvo.');
            return;
        }
        if (!configuracaoCatcher.palavras.length || !configuracaoCatcher.tlds.length) {
            await carregarConfiguracaoCatcher(dominioSelecionado);
        }
        setExecutandoCatcher(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/catcher`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dominioId: dominioSelecionado })
            });
            if (!resposta.ok) throw new Error();
            message.success('Consulta enfileirada. Acompanhe os resultados.');
        } catch {
            message.error('Não foi possível iniciar o phishing_catcher.');
        } finally {
            setExecutandoCatcher(false);
        }
    };

    const adicionarPalavra = () => {
        setConfiguracaoCatcher((atual) => ({ ...atual, palavras: [...atual.palavras, { termo: '', peso: 1 }] }));
    };

    const atualizarPalavra = (indice: number, chave: keyof PalavraCatcher, valor: string | number | null) => {
        setConfiguracaoCatcher((atual) => {
            const palavras = [...atual.palavras];
            const item = palavras[indice];
            if (!item) return atual;
            const novo = { ...item, [chave]: chave === 'peso' ? Math.max(1, Number(valor) || 1) : String(valor ?? '').toLowerCase() } as PalavraCatcher;
            palavras[indice] = novo;
            return { ...atual, palavras };
        });
    };

    const removerPalavra = (indice: number) => {
        setConfiguracaoCatcher((atual) => ({ ...atual, palavras: atual.palavras.filter((_, posicao) => posicao !== indice) }));
    };

    const alterarTlds = (lista: string[]) => {
        setConfiguracaoCatcher((atual) => ({ ...atual, tlds: lista }));
    };

    const abrirAjuda = (titulo: string, descricao: React.ReactNode) => setModalAjuda({ titulo, descricao });

    const tituloSecao = (texto: string, onClick: () => void) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong>{texto}</Text>
            <Button type="link" size="small" icon={<InfoCircleOutlined />} onClick={onClick} />
        </div>
    );

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
                            <Title level={4} style={{ margin: 0 }}>Phishing</Title>
                            <Text type="secondary">Descoberta de paginas de phishing.</Text>
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
                                    carregarConfiguracaoCatcher(valor);
                                } else {
                                    setTermos([]);
                                    setEntradaTermos([]);
                                    setConfiguracaoCatcher(configInicial);
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
                    <PainelFerramenta>
                        <IconeFerramenta>
                            <SafetyOutlined />
                        </IconeFerramenta>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                <div>
                                    <Text strong>phishing_catcher</Text>
                                    <div><Text type="secondary">Prioriza TLDs e pesos por palavra-chave na caça ativa.</Text></div>
                                </div>
                            </div>
                            <AcoesFerramenta>
                                <Button icon={<SettingOutlined />} onClick={abrirConfiguracaoCatcher}>
                                    Ajustar configuração
                                </Button>
                                <Button type="primary" icon={<ThunderboltOutlined />} loading={executandoCatcher} onClick={executarPhishingCatcher}>
                                    Consultar agora
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

            <Modal
                title="Configuração do phishing_catcher"
                open={modalConfiguracaoCatcher}
                onOk={salvarConfiguracaoCatcher}
                onCancel={() => setModalConfiguracaoCatcher(false)}
                confirmLoading={salvandoConfiguracao}
                okText="Salvar configuração"
            >
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    {tituloSecao('Palavras-chave monitoradas', () => abrirAjuda('Palavras-chave monitoradas', (
                        <Space direction="vertical">
                            <Text>Itens usados para pontuar nomes parecidos; cada palavra aumenta o score conforme o peso definido.</Text>
                            <Text>Adicionar mais termos amplia a cobertura, enquanto remover reduz alertas para aquela marca.</Text>
                            <Text>Pesos maiores deixam o alerta mais sensível para aquela palavra específica.</Text>
                        </Space>
                    )))}
                    {carregandoConfiguracao ? <Skeleton active paragraph={{ rows: 3 }} /> : (
                        <Space direction="vertical" style={{ width: '100%' }} size={8}>
                            {configuracaoCatcher.palavras.map((palavra, indice) => (
                                <Row gutter={8} key={`${palavra.termo}-${indice}`} align="middle">
                                    <Col span={12}>
                                        <Input
                                            placeholder="palavra-chave"
                                            value={palavra.termo}
                                            onChange={(evento) => atualizarPalavra(indice, 'termo', evento.target.value)}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <InputNumber
                                            min={1}
                                            value={palavra.peso}
                                            onChange={(valor) => atualizarPalavra(indice, 'peso', valor)}
                                            style={{ width: '100%' }}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Button danger icon={<MinusCircleOutlined />} onClick={() => removerPalavra(indice)} block />
                                    </Col>
                                </Row>
                            ))}
                            <Button icon={<PlusOutlined />} onClick={adicionarPalavra} block>
                                Adicionar palavra
                            </Button>
                        </Space>
                    )}
                    <Divider style={{ margin: '8px 0' }} />
                    {tituloSecao('TLDs priorizados', () => abrirAjuda('TLDs priorizados', (
                        <Space direction="vertical">
                            <Text>Define quais terminações de domínio serão acompanhadas de perto.</Text>
                            <Text>Somente TLDs listados serão considerados na priorização; remover um item reduz alertas nele.</Text>
                            <Text>Adicionar novas terminações amplia o escopo de caça para aquele domínio.</Text>
                        </Space>
                    )))}
                    {carregandoConfiguracao ? <Skeleton active paragraph={{ rows: 2 }} /> : (
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            value={configuracaoCatcher.tlds}
                            onChange={alterarTlds}
                            tokenSeparators={[',', ' ']}
                            placeholder="Digite TLDs e pressione enter"
                        />
                    )}
                </Space>
            </Modal>

            <Modal
                open={!!modalAjuda}
                onCancel={() => setModalAjuda(null)}
                footer={null}
                title={modalAjuda?.titulo}
            >
                {modalAjuda?.descricao}
            </Modal>
        </Container>
    );
};

export default PhishingView;
