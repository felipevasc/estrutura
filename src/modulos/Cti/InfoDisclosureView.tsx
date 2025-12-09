'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Alert, Tag, Button, Select, message, Space, Typography, Popconfirm, Modal, Input, Spin, Tabs, Tooltip } from 'antd';
import styled from 'styled-components';
import { useStore } from '@/hooks/useStore';
import { Dominio } from '@prisma/client';
import { SettingOutlined, ReloadOutlined, RadarChartOutlined, SearchOutlined, GithubOutlined, FileTextOutlined } from '@ant-design/icons';

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
  grid-template-columns: minmax(0, 2.4fr) minmax(280px, 1fr);
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
  gap: 10px;
`;

const CabecalhoFerramentas = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const AbasFerramentas = styled(Tabs)`
  .ant-tabs-nav {
    margin: 0;
  }

  .ant-tabs-nav-list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 6px;
  }

  .ant-tabs-tab {
    justify-content: center;
    margin: 0;
    font-weight: 700;
  }
`;

const ListaFerramentas = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
`;

const BlocoFerramenta = styled.div`
  display: grid;
  grid-template-columns: 1fr 44px;
  gap: 8px;
  align-items: center;
`;

const BotaoFerramenta = styled(Button)`
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 700;
  border-radius: ${({ theme }) => theme.borders.radius};
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const BotaoIcone = styled(Button)`
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borders.radius};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const EtiquetaSecao = styled.span`
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Centralizador = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
`;

interface InfoDisclosureRecord {
    id: number;
    url: string;
    fonte: string;
    titulo?: string;
    snippet?: string;
    criadoEm: string;
    dominioId: number;
    dominio: {
        endereco: string;
    };
}

const formatarCategoria = (categoria: string) => categoria.split(/[-_]/).map(parte => parte.charAt(0).toUpperCase() + parte.slice(1)).join(' ');
const gerarDescricao = (rotulo: string) => `Busca por ${rotulo.toLowerCase()} utilizando dorks.`;

const InfoDisclosureView = () => {
    const { projeto } = useStore();
    const projetoId = projeto?.get()?.id;
    const [dominios, setDominios] = useState<Dominio[]>([]);
    const [dominioSelecionado, setDominioSelecionado] = useState<number | null>(null);
    const [dados, setDados] = useState<InfoDisclosureRecord[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [executando, setExecutando] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [categoriasDork, setCategoriasDork] = useState<string[]>([]);
    const [modalConfiguracaoVisivel, setModalConfiguracaoVisivel] = useState(false);
    const [categoriaAtualConfiguracao, setCategoriaAtualConfiguracao] = useState<string | null>(null);
    const [listaAtualConfiguracao, setListaAtualConfiguracao] = useState<string>("");
    const [salvandoConfiguracao, setSalvandoConfiguracao] = useState(false);

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
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/disclosure`);
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
            const resposta = await fetch('/api/v1/configuracoes/dorks/disclosure');
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

    const executarFerramenta = async (ferramenta: string, grupo: string) => {
        if (!dominioSelecionado) {
            message.warning('Selecione um domínio alvo para continuar.');
            return;
        }
        const chaveExecucao = `${grupo}-${ferramenta}`;
        setExecutando(chaveExecucao);
        const rotulo = formatarCategoria(ferramenta);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/disclosure/executar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dominioId: dominioSelecionado, ferramenta, grupo }),
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
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/disclosure`, {
                method: 'DELETE',
            });
            if (!resposta.ok) {
                const dadosErro = await resposta.json();
                throw new Error(dadosErro.error || 'Falha ao limpar os dados.');
            }
            message.success('Dados de Information Disclosure limpos com sucesso.');
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
            const resposta = await fetch('/api/v1/configuracoes/dorks/disclosure');
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
            const respostaConfiguracao = await fetch('/api/v1/configuracoes/dorks/disclosure');
            const configuracaoAtual = await respostaConfiguracao.json();
            const novaLista = listaAtualConfiguracao.split('\n').map(item => item.trim()).filter(item => item.length > 0);
            configuracaoAtual[categoriaAtualConfiguracao] = novaLista;
            const respostaEnvio = await fetch('/api/v1/configuracoes/dorks/disclosure', {
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

    const ferramentasFixas = [
        {
            chave: 'codigo',
            grupo: 'repositorios',
            rotulo: 'Código Aberto',
            descricao: 'Busca por menções ao domínio em GitHub, GitLab e Bitbucket.',
            icone: <GithubOutlined />
        },
        {
            chave: 'pastes',
            grupo: 'pastes',
            rotulo: 'Pastes',
            descricao: 'Identificação de colagens públicas contendo o domínio.',
            icone: <FileTextOutlined />
        }
    ];

    const ferramentasDork = categoriasDork.map(categoria => ({
        chave: categoria,
        grupo: 'dorks',
        rotulo: formatarCategoria(categoria),
        descricao: gerarDescricao(formatarCategoria(categoria)),
        icone: <SearchOutlined />,
        configuravel: true
    }));

    const gruposFerramentas = [
        { chave: 'dorks', titulo: 'Dorks', itens: ferramentasDork },
        { chave: 'repositorios', titulo: 'Repositórios', itens: [ferramentasFixas[0]] },
        { chave: 'pastes', titulo: 'Pastes', itens: [ferramentasFixas[1]] }
    ];

    const colunas = [
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            width: 300,
            render: (texto: string) => (
                <a href={texto} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                    {texto}
                </a>
            )
        },
        { title: 'Título', dataIndex: 'titulo', key: 'titulo', ellipsis: true },
        { title: 'Snippet', dataIndex: 'snippet', key: 'snippet', ellipsis: true },
        { title: 'Domínio', dataIndex: ['dominio', 'endereco'], key: 'dominio' },
        { title: 'Fonte', dataIndex: 'fonte', key: 'fonte', render: (fonte: string) => <Tag color="blue">{fonte}</Tag> },
        { title: 'Data', dataIndex: 'criadoEm', key: 'criadoEm', render: (texto: string) => new Date(texto).toLocaleString() }
    ];

    return (
        <Container>
            <Grade>
                <PainelVidro>
                    <Cabecalho>
                        <BlocoTitulo>
                            <Title level={4} style={{ margin: 0 }}>Information Disclosure</Title>
                            <Subtitulo>Descoberta de vazamentos e informações sensíveis.</Subtitulo>
                        </BlocoTitulo>
                        <Space>
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
                        <Table
                            dataSource={dadosFiltrados}
                            columns={colunas}
                            rowKey="id"
                            bordered={false}
                            loading={carregando}
                            pagination={{ pageSize: 8 }}
                            scroll={{ x: true }}
                        />
                    </AreaTabela>
                </PainelVidro>
                <PainelFerramentas>
                    <CabecalhoFerramentas>
                        <div>
                            <EtiquetaSecao>Ferramentas</EtiquetaSecao>
                            <Title level={5} style={{ margin: 0 }}>Ações rápidas</Title>
                        </div>
                        <Tag color="processing">CTI</Tag>
                    </CabecalhoFerramentas>
                    <AbasFerramentas defaultActiveKey="dorks">
                        {gruposFerramentas.map(grupo => (
                            <TabPane tab={grupo.titulo} key={grupo.chave}>
                                {grupo.chave === 'dorks' && categoriasDork.length === 0 ? (
                                    <Centralizador><Spin /></Centralizador>
                                ) : (
                                    <ListaFerramentas>
                                        {grupo.itens.map(item => (
                                            <BlocoFerramenta key={item.chave}>
                                                <Tooltip title={item.descricao}>
                                                    <BotaoFerramenta
                                                        icon={item.icone}
                                                        onClick={() => executarFerramenta(item.chave, item.grupo)}
                                                        loading={executando === `${item.grupo}-${item.chave}`}
                                                        disabled={!!executando || !dominioSelecionado}
                                                        type={item.grupo === 'dorks' ? 'default' : 'primary'}
                                                    >
                                                        {item.rotulo}
                                                    </BotaoFerramenta>
                                                </Tooltip>
                                                {item.configuravel && (
                                                    <Tooltip title="Configurar lista">
                                                        <BotaoIcone
                                                            icon={<SettingOutlined />}
                                                            onClick={() => abrirModalConfiguracao(item.chave)}
                                                            loading={salvandoConfiguracao && categoriaAtualConfiguracao === item.chave}
                                                            disabled={!!executando}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </BlocoFerramenta>
                                        ))}
                                    </ListaFerramentas>
                                )}
                            </TabPane>
                        ))}
                    </AbasFerramentas>
                </PainelFerramentas>
            </Grade>
            {erro && <Alert message="Erro" description={erro} type="error" showIcon />}

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
        </Container>
    );
};

export default InfoDisclosureView;
