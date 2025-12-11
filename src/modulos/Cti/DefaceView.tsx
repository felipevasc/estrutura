'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Alert, Tag, Button, Select, message, Space, Typography, Popconfirm, Modal, Input, Spin, Tabs, Tooltip, InputNumber, Segmented, Image, Empty } from 'antd';
import styled from 'styled-components';
import { useStore } from '@/hooks/useStore';
import { Dominio } from '@prisma/client';
import { SettingOutlined, ReloadOutlined, RadarChartOutlined, AppstoreOutlined, TableOutlined, PictureOutlined, EyeOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const Grade = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(320px, 1fr);
  gap: 16px;
  align-items: start;
  width: 100%;
`;

const PainelVidro = styled.div`
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borders.radius};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
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

const Subtitulo = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SeletorAlvo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const Etiqueta = styled.span`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const AreaTabela = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;

  .ant-table-container {
    border-radius: ${({ theme }) => theme.borders.radius};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    overflow: hidden;
    box-shadow: ${({ theme }) => theme.shadows.soft};
  }
`;

const PainelFerramentas = styled(PainelVidro)`
  background: ${({ theme }) => theme.glass.default};
  gap: 12px;
`;

const AbasFerramentas = styled(Tabs)`
  .ant-tabs-nav {
    margin: 0;
  }

  .ant-tabs-nav-list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 6px;
  }

  .ant-tabs-tab {
    justify-content: center;
    margin: 0;
    font-weight: 600;
  }
`;

const ListaFerramentas = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
`;

const CartaoFerramenta = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 16px 14px 16px;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borders.radius};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: -1px auto -1px -1px;
    width: 4px;
    background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.info} 100%);
  }
`;

const CabecalhoFerramenta = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

const BlocoInfoFerramenta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RotuloFerramenta = styled.span`
  font-weight: 800;
  font-size: 15px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const DescricaoFerramenta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const GrupoAcoes = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TagCategoria = styled(Tag)`
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.04em;
`;

const BotaoConfiguracao = styled(Button)`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borders.radius};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background: ${({ theme }) => theme.glass.default};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const RodapeFerramenta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const Acionador = styled(Button)`
  flex: 1;
  font-weight: 700;
`;

const GradeCapturas = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
`;

const CartaoCaptura = styled.div`
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: ${({ theme }) => theme.borders.radius};
  overflow: hidden;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const ImagemCaptura = styled.div<{ $url: string }>`
  position: absolute;
  inset: 0;
  background: ${({ $url }) => $url ? `url(${$url}) center / cover no-repeat` : '#0b0b0b'};
  filter: ${({ $url }) => $url ? 'none' : 'grayscale(1)'};
`;

const RodapeCaptura = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%);
  color: #fff;
`;

const TituloCaptura = styled.span`
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AcoesCaptura = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${CartaoCaptura}:hover & {
    opacity: 1;
  }
`;

interface DefaceRecord {
    id: number;
    url: string;
    fonte: string;
    createdAt: string;
    captura?: string | null;
    capturadoEm?: Date | null;
    dominioId: number;
    dominio: {
        endereco: string;
    };
}

const formatarCategoria = (categoria: string) => categoria.split(/[-_]/).map(parte => parte.charAt(0).toUpperCase() + parte.slice(1)).join(' ');
const gerarDescricao = (rotulo: string) => `Varredura específica de ${rotulo.toLowerCase()}.`;

const DefaceView = () => {
    const { projeto } = useStore();
    const projetoId = projeto?.get()?.id;
    const [dominios, setDominios] = useState<Dominio[]>([]);
    const [dominioSelecionado, setDominioSelecionado] = useState<number | null>(null);
    const [dados, setDados] = useState<DefaceRecord[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [executando, setExecutando] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [categoriasDork, setCategoriasDork] = useState<string[]>([]);
    const [modalConfiguracaoVisivel, setModalConfiguracaoVisivel] = useState(false);
    const [categoriaAtualConfiguracao, setCategoriaAtualConfiguracao] = useState<string | null>(null);
    const [listaAtualConfiguracao, setListaAtualConfiguracao] = useState<string>("");
    const [salvandoConfiguracao, setSalvandoConfiguracao] = useState(false);
    const [paginasZoneXsec, setPaginasZoneXsec] = useState(10);
    const [modalZoneXsecVisivel, setModalZoneXsecVisivel] = useState(false);
    const [entradaPaginasZoneXsec, setEntradaPaginasZoneXsec] = useState(10);
    const [paginasHackDb, setPaginasHackDb] = useState(10);
    const [modalHackDbVisivel, setModalHackDbVisivel] = useState(false);
    const [entradaPaginasHackDb, setEntradaPaginasHackDb] = useState(10);
    const [visualizacao, setVisualizacao] = useState<'tabela' | 'capturas'>('tabela');
    const [capturando, setCapturando] = useState(false);
    const [capturandoIndividuais, setCapturandoIndividuais] = useState<number[]>([]);
    const [capturaSelecionada, setCapturaSelecionada] = useState<string | null>(null);

    const resolverUrlCaptura = useCallback((caminho?: string | null) => {
        if (!caminho) return '';
        if (caminho.startsWith('http')) return caminho;
        if (typeof window === 'undefined') return caminho;
        const caminhoNormalizado = caminho.startsWith('/') ? caminho : `/${caminho}`;
        return `${window.location.origin}${caminhoNormalizado}`;
    }, []);

    const buscarDominios = useCallback(async () => {
        if (!projetoId) return;
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/dominios`);
            const resultado = await resposta.json();
            setDominios(resultado);
        } catch {
            message.error('Falha ao carregar a lista de domínios.');
        }
    }, [projetoId]);

    const buscarDados = useCallback(async () => {
        if (!projetoId) return;
        setCarregando(true);
        setErro(null);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/deface`);
            if (!resposta.ok) throw new Error('Falha ao buscar os dados.');
            const resultado = await resposta.json();
            setDados(resultado);
        } catch (err) {
            setErro(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setCarregando(false);
        }
    }, [projetoId]);

    const buscarConfiguracaoDork = useCallback(async () => {
        try {
            const resposta = await fetch('/api/v1/configuracoes/dorks');
            if (resposta.ok) {
                const configuracao = await resposta.json();
                setCategoriasDork(Object.keys(configuracao));
            }
        } catch {
            message.error('Falha ao carregar as categorias de dorks.');
        }
    }, []);

    useEffect(() => {
        buscarDominios();
        buscarDados();
        buscarConfiguracaoDork();
    }, [buscarDominios, buscarDados, buscarConfiguracaoDork]);

    const dadosFiltrados = dominioSelecionado ? dados.filter((item) => item.dominioId === dominioSelecionado) : dados;

    const executarFerramenta = async (ferramenta: string, grupo: string, parametrosExtras: Record<string, any> = {}) => {
        if (!dominioSelecionado) {
            message.warning('Selecione um domínio alvo para continuar.');
            return;
        }
        const chaveExecucao = `${grupo}-${ferramenta}`;
        setExecutando(chaveExecucao);
        const rotulo = formatarCategoria(ferramenta);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/deface/executar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dominioId: dominioSelecionado, ferramenta, grupo, ...parametrosExtras }),
            });
            if (!resposta.ok) throw new Error('Falha ao enfileirar a tarefa.');
            message.success(`Tarefa '${rotulo}' enfileirada.`);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Erro desconhecido.');
        } finally {
            setExecutando(null);
        }
    };

    const limparDados = async () => {
        if (!projetoId) return;
        setCarregando(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/deface`, {
                method: 'DELETE',
            });
            if (!resposta.ok) {
                const dadosErro = await resposta.json();
                throw new Error(dadosErro.error || 'Falha ao limpar os dados.');
            }
            message.success('Dados de deface limpos com sucesso.');
            setDados([]);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setCarregando(false);
        }
    };

    const abrirModalConfiguracao = async (categoria: string) => {
        setCategoriaAtualConfiguracao(categoria);
        setSalvandoConfiguracao(true);
        try {
            const resposta = await fetch('/api/v1/configuracoes/dorks');
            const configuracao = await resposta.json();
            const lista = configuracao[categoria] || [];
            setListaAtualConfiguracao(lista.join('\n'));
            setModalConfiguracaoVisivel(true);
        } catch {
            message.error('Erro ao carregar configuração.');
        } finally {
            setSalvandoConfiguracao(false);
        }
    };

    const salvarConfiguracao = async () => {
        if (!categoriaAtualConfiguracao) return;
        setSalvandoConfiguracao(true);
        try {
            const respostaConfiguracao = await fetch('/api/v1/configuracoes/dorks');
            const configuracaoAtual = await respostaConfiguracao.json();
            const novaLista = listaAtualConfiguracao.split('\n').map(item => item.trim()).filter(item => item.length > 0);
            configuracaoAtual[categoriaAtualConfiguracao] = novaLista;
            const respostaEnvio = await fetch('/api/v1/configuracoes/dorks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configuracaoAtual)
            });
            if (!respostaEnvio.ok) throw new Error('Falha ao salvar.');
            message.success('Configuração atualizada com sucesso.');
            setModalConfiguracaoVisivel(false);
            buscarConfiguracaoDork();
        } catch {
            message.error('Erro ao salvar configuração.');
        } finally {
            setSalvandoConfiguracao(false);
        }
    };

    const abrirModalZoneXsec = () => {
        setEntradaPaginasZoneXsec(paginasZoneXsec);
        setModalZoneXsecVisivel(true);
    };

    const salvarPaginasZoneXsec = () => {
        const valor = entradaPaginasZoneXsec && entradaPaginasZoneXsec > 0 ? entradaPaginasZoneXsec : 10;
        setPaginasZoneXsec(valor);
        setModalZoneXsecVisivel(false);
        message.success('Configuração atualizada.');
    };

    const abrirModalHackDb = () => {
        setEntradaPaginasHackDb(paginasHackDb);
        setModalHackDbVisivel(true);
    };

    const salvarPaginasHackDb = () => {
        const valor = entradaPaginasHackDb && entradaPaginasHackDb > 0 ? entradaPaginasHackDb : 10;
        setPaginasHackDb(valor);
        setModalHackDbVisivel(false);
        message.success('Configuração atualizada.');
    };

    const capturarPrints = async () => {
        if (!projetoId) return;
        setCapturando(true);
        try {
            const corpo = dominioSelecionado ? { dominioId: dominioSelecionado } : {};
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/deface/capturas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corpo)
            });
            if (!resposta.ok) throw new Error();
            message.success('Capturas enfileiradas.');
        } catch {
            message.error('Não foi possível enfileirar as capturas.');
        } finally {
            setCapturando(false);
        }
    };

    const capturarRegistro = async (registro: DefaceRecord) => {
        if (!projetoId) return;
        setCapturandoIndividuais((lista) => [...lista, registro.id]);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/deface/capturas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [registro.id], dominioId: registro.dominioId })
            });
            if (!resposta.ok) throw new Error();
            message.success('Captura enfileirada.');
        } catch {
            message.error('Não foi possível enfileirar a captura.');
        } finally {
            setCapturandoIndividuais((lista) => lista.filter((item) => item !== registro.id));
        }
    };

    const abrirModalCaptura = (caminho: string) => setCapturaSelecionada(caminho);
    const fecharModalCaptura = () => setCapturaSelecionada(null);

    const colunas = [
        { title: 'URL', dataIndex: 'url', key: 'url', render: (texto: string) => <a href={texto} target="_blank" rel="noopener noreferrer">{texto}</a> },
        { title: 'Domínio', dataIndex: ['dominio', 'endereco'], key: 'dominio' },
        { title: 'Fonte', dataIndex: 'fonte', key: 'fonte', render: (fonte: string) => <Tag color="blue">{fonte}</Tag> },
        { title: 'Data da Descoberta', dataIndex: 'createdAt', key: 'createdAt', render: (texto: string) => new Date(texto).toLocaleString() },
        { title: 'Capturado em', dataIndex: 'capturadoEm', key: 'capturadoEm', render: (texto?: string | null) => texto ? new Date(texto).toLocaleString() : '-' },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_: string, registro: DefaceRecord) => {
                const urlCaptura = resolverUrlCaptura(registro.captura);
                const carregando = capturandoIndividuais.includes(registro.id);
                return (
                    <Space>
                        <Tooltip title="Capturar agora">
                            <Button
                                icon={<PictureOutlined />}
                                loading={carregando}
                                onClick={() => capturarRegistro(registro)}
                                disabled={carregando}
                            />
                        </Tooltip>
                        <Tooltip title="Visualizar captura">
                            <Button
                                icon={<EyeOutlined />}
                                disabled={!registro.captura}
                                onClick={() => urlCaptura && abrirModalCaptura(urlCaptura)}
                            />
                        </Tooltip>
                    </Space>
                );
            }
        }
    ];

    return (
        <Container>
            <Grade>
                <PainelVidro>
                    <Cabecalho>
                        <BlocoTitulo>
                            <Title level={4} style={{ margin: 0 }}>Deface Scanner</Title>
                            <Subtitulo>Descoberta de paginas de deface por dominio.</Subtitulo>
                        </BlocoTitulo>
                        <Space>
                            <Segmented
                                value={visualizacao}
                                onChange={(valor) => setVisualizacao(valor as 'tabela' | 'capturas')}
                                options={[
                                    { value: 'tabela', icon: <TableOutlined /> },
                                    { value: 'capturas', icon: <AppstoreOutlined /> }
                                ]}
                            />
                            <Tooltip title="Capturar prints">
                                <Button icon={<PictureOutlined />} onClick={capturarPrints} loading={capturando} disabled={!dadosFiltrados.length} />
                            </Tooltip>
                            <Button icon={<ReloadOutlined />} onClick={buscarDados} loading={carregando}>
                                Atualizar
                            </Button>
                            <Popconfirm
                                title="Limpar todos os dados?"
                                description="Esta ação é irreversível. Deseja continuar?"
                                onConfirm={limparDados}
                                okText="Sim"
                                cancelText="Não"
                            >
                                <Button danger>Limpar</Button>
                            </Popconfirm>
                        </Space>
                    </Cabecalho>
                    <SeletorAlvo>
                        <div style={{ minWidth: 120 }}>
                            <Etiqueta>Domínio alvo</Etiqueta>
                        </div>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Selecione um domínio"
                            onChange={(valor) => setDominioSelecionado(valor)}
                            allowClear
                            disabled={!projetoId}
                            value={dominioSelecionado ?? undefined}
                        >
                            {dominios.map(dominio => <Option key={dominio.id} value={dominio.id}>{dominio.endereco}</Option>)}
                        </Select>
                        <Tooltip title="Recarregar domínios">
                            <Button icon={<RadarChartOutlined />} onClick={buscarDominios} disabled={!projetoId} />
                        </Tooltip>
                    </SeletorAlvo>
                    <AreaTabela>
                        {visualizacao === 'tabela' ? (
                            <Table
                                dataSource={dadosFiltrados}
                                columns={colunas}
                                rowKey="id"
                                bordered={false}
                                loading={carregando}
                                pagination={{ pageSize: 8 }}
                                scroll={{ x: true }}
                            />
                        ) : (
                            dadosFiltrados.length ? (
                                <GradeCapturas>
                                    {dadosFiltrados.map((registro) => {
                                        const urlCaptura = resolverUrlCaptura(registro.captura);
                                        const carregando = capturandoIndividuais.includes(registro.id);
                                        const possuiCaptura = Boolean(registro.captura);
                                        return (
                                            <CartaoCaptura key={registro.id}>
                                                <ImagemCaptura $url={urlCaptura} />
                                                <AcoesCaptura>
                                                    <Tooltip title="Visualizar">
                                                        <Button
                                                            shape="circle"
                                                            icon={<EyeOutlined />}
                                                            disabled={!possuiCaptura}
                                                            onClick={() => urlCaptura && abrirModalCaptura(urlCaptura)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Capturar novamente">
                                                        <Button
                                                            shape="circle"
                                                            icon={<PictureOutlined />}
                                                            loading={carregando}
                                                            onClick={() => capturarRegistro(registro)}
                                                        />
                                                    </Tooltip>
                                                </AcoesCaptura>
                                                <RodapeCaptura>
                                                    <TituloCaptura>{registro.url}</TituloCaptura>
                                                    <Space size={4} wrap>
                                                        <Tag color="geekblue">{registro.dominio.endereco}</Tag>
                                                        <Tag color="blue">{registro.fonte}</Tag>
                                                        <Text style={{ color: '#fff' }}>{new Date(registro.createdAt).toLocaleString()}</Text>
                                                    </Space>
                                                </RodapeCaptura>
                                            </CartaoCaptura>
                                        );
                                    })}
                                </GradeCapturas>
                            ) : (
                                <Empty description="Nenhuma captura disponível" />
                            )
                        )}
                    </AreaTabela>
                </PainelVidro>
                <PainelFerramentas>
                    <AbasFerramentas defaultActiveKey="dorks">
                        <TabPane tab="Dorks" key="dorks">
                            <Subtitulo style={{ display: 'block', marginBottom: 8 }}>Selecione a busca desejada.</Subtitulo>
                            <ListaFerramentas>
                                {categoriasDork.length === 0 && <Spin />}
                                {categoriasDork.map(categoria => {
                                    const rotulo = formatarCategoria(categoria);
                                    const descricao = gerarDescricao(rotulo);
                                    return (
                                        <CartaoFerramenta key={categoria}>
                                            <CabecalhoFerramenta>
                                                <BlocoInfoFerramenta>
                                                    <RotuloFerramenta>{rotulo}</RotuloFerramenta>
                                                    <DescricaoFerramenta>{descricao}</DescricaoFerramenta>
                                                </BlocoInfoFerramenta>
                                                <GrupoAcoes>
                                                    <TagCategoria color="blue">{categoria.toUpperCase()}</TagCategoria>
                                                    <BotaoConfiguracao
                                                        icon={<SettingOutlined />}
                                                        onClick={() => abrirModalConfiguracao(categoria)}
                                                        loading={salvandoConfiguracao && categoriaAtualConfiguracao === categoria}
                                                    />
                                                </GrupoAcoes>
                                            </CabecalhoFerramenta>
                                            <RodapeFerramenta>
                                                    <Acionador
                                                        type="primary"
                                                        icon={<RadarChartOutlined />}
                                                        onClick={() => executarFerramenta(categoria, 'dorks')}
                                                        loading={executando === `dorks-${categoria}`}
                                                        disabled={!!executando || !dominioSelecionado}
                                                    >
                                                        Executar varredura
                                                </Acionador>
                                            </RodapeFerramenta>
                                        </CartaoFerramenta>
                                    );
                                })}
                            </ListaFerramentas>
                        </TabPane>
                        <TabPane tab="Foruns" key="foruns">
                            <Subtitulo style={{ display: 'block', marginBottom: 8 }}>Coleta em espelhos de deface.</Subtitulo>
                            <ListaFerramentas>
                                <CartaoFerramenta>
                                    <CabecalhoFerramenta>
                                        <BlocoInfoFerramenta>
                                            <RotuloFerramenta>Zone-Xsec</RotuloFerramenta>
                                            <DescricaoFerramenta>Busca registros do Zone-Xsec relacionados ao domínio selecionado.</DescricaoFerramenta>
                                        </BlocoInfoFerramenta>
                                        <GrupoAcoes>
                                            <TagCategoria color="purple">ZONE-XSEC</TagCategoria>
                                            <BotaoConfiguracao icon={<SettingOutlined />} onClick={abrirModalZoneXsec} />
                                        </GrupoAcoes>
                                    </CabecalhoFerramenta>
                                    <RodapeFerramenta>
                                        <Acionador
                                            type="primary"
                                            icon={<RadarChartOutlined />}
                                            onClick={() => executarFerramenta('zone-xsec', 'foruns', { paginas: paginasZoneXsec })}
                                            loading={executando === 'foruns-zone-xsec'}
                                            disabled={!!executando || !dominioSelecionado}
                                        >
                                            Executar busca
                                        </Acionador>
                                    </RodapeFerramenta>
                                </CartaoFerramenta>
                                <CartaoFerramenta>
                                    <CabecalhoFerramenta>
                                        <BlocoInfoFerramenta>
                                            <RotuloFerramenta>Hack-DB</RotuloFerramenta>
                                            <DescricaoFerramenta>Busca registros do Hack-DB relacionados ao domínio selecionado.</DescricaoFerramenta>
                                        </BlocoInfoFerramenta>
                                        <GrupoAcoes>
                                            <TagCategoria color="orange">HACK-DB</TagCategoria>
                                            <BotaoConfiguracao icon={<SettingOutlined />} onClick={abrirModalHackDb} />
                                        </GrupoAcoes>
                                    </CabecalhoFerramenta>
                                    <RodapeFerramenta>
                                        <Acionador
                                            type="primary"
                                            icon={<RadarChartOutlined />}
                                            onClick={() => executarFerramenta('hack-db', 'foruns', { paginas: paginasHackDb })}
                                            loading={executando === 'foruns-hack-db'}
                                            disabled={!!executando || !dominioSelecionado}
                                        >
                                            Executar busca
                                        </Acionador>
                                    </RodapeFerramenta>
                                </CartaoFerramenta>
				<CartaoFerramenta>
                                  <CabecalhoFerramenta>
                                    <BlocoInfoFerramenta>
				      <RotuloFerramenta>Zone-H</RotuloFerramenta>
				    </BlocoInfoFerramenta>
				  </CabecalhoFerramenta>
				</CartaoFerramenta>
                            </ListaFerramentas>
                        </TabPane>
                    </AbasFerramentas>
                </PainelFerramentas>
            </Grade>
            {erro && <Alert message="Erro" description={erro} type="error" showIcon />}

            <Modal
                open={Boolean(capturaSelecionada)}
                onCancel={fecharModalCaptura}
                footer={null}
                centered
                width={900}
                bodyStyle={{ padding: 0, background: '#000' }}
            >
                {capturaSelecionada && <Image src={capturaSelecionada} alt="Captura de deface" preview={false} style={{ width: '100%' }} />}
            </Modal>

            <Modal
                title={`Configurar Dorks: ${categoriaAtualConfiguracao}`}
                open={modalConfiguracaoVisivel}
                onOk={salvarConfiguracao}
                onCancel={() => setModalConfiguracaoVisivel(false)}
                confirmLoading={salvandoConfiguracao}
            >
                <Alert message="Insira uma frase/palavra por linha." type="info" style={{ marginBottom: 16 }} />
                <TextArea
                    rows={10}
                    value={listaAtualConfiguracao}
                    onChange={(evento) => setListaAtualConfiguracao(evento.target.value)}
                />
            </Modal>
            <Modal
                title="Configurar Zone-Xsec"
                open={modalZoneXsecVisivel}
                onOk={salvarPaginasZoneXsec}
                onCancel={() => setModalZoneXsecVisivel(false)}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>Quantidade de páginas a consultar</Text>
                    <InputNumber
                        min={1}
                        value={entradaPaginasZoneXsec}
                        onChange={(valor) => setEntradaPaginasZoneXsec(valor || 1)}
                        style={{ width: '100%' }}
                    />
                </Space>
            </Modal>
            <Modal
                title="Configurar Hack-DB"
                open={modalHackDbVisivel}
                onOk={salvarPaginasHackDb}
                onCancel={() => setModalHackDbVisivel(false)}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>Quantidade de páginas a consultar</Text>
                    <InputNumber
                        min={1}
                        value={entradaPaginasHackDb}
                        onChange={(valor) => setEntradaPaginasHackDb(valor || 1)}
                        style={{ width: '100%' }}
                    />
                </Space>
            </Modal>
        </Container>
    );
};

export default DefaceView;
