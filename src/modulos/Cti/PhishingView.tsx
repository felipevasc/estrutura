'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button, Table, Typography, Space, Select, Tag, message, Modal, Divider, Tooltip, Alert, Badge, Skeleton, Input, InputNumber, Row, Col, Popconfirm, Segmented, Card, Image, Pagination, Empty } from 'antd';
import styled from 'styled-components';
import { useStore } from '@/hooks/useStore';
import { Dominio, PhishingStatus } from '@prisma/client';
import { RadarChartOutlined, ReloadOutlined, SettingOutlined, ThunderboltOutlined, SafetyOutlined, InfoCircleOutlined, PlusOutlined, MinusCircleOutlined, SecurityScanOutlined, EditOutlined, DeleteOutlined, PictureOutlined, AppstoreOutlined, TableOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const tamanhoPaginaCapturas = 8;

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

const PainelVisualizacao = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GradeCapturas = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
`;

const LugarImagem = styled.div`
  height: 220px;
  border: 1px dashed ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borders.radius};
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.glass.default};
  color: #8c8c8c;
  font-weight: 600;
`;

const RodapeCartao = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

interface RegistroPhishing {
    id: number;
    alvo: string;
    termo: string;
    fonte: string;
    criadoEm: string;
    ultimaVerificacao?: string;
    statusUltimaVerificacao?: 'ONLINE' | 'OFFLINE';
    dominio: { endereco: string };
    status?: PhishingStatus;
    captura?: string | null;
    capturadoEm?: string | null;
}

type PalavraCatcher = { termo: string; peso: number };

type ConfiguracaoCatcher = { palavras: PalavraCatcher[]; tlds: string[]; padrao?: { palavras: PalavraCatcher[]; tlds: string[] } };

type BasePhishing = { palavrasChave: string[]; palavrasAuxiliares: string[]; tlds: string[]; padrao?: { palavrasChave: string[]; palavrasAuxiliares: string[]; tlds: string[] } };

const configInicial: ConfiguracaoCatcher = { palavras: [], tlds: [], padrao: { palavras: [], tlds: [] } };
const baseInicial: BasePhishing = { palavrasChave: [], palavrasAuxiliares: [], tlds: [], padrao: { palavrasChave: [], palavrasAuxiliares: [], tlds: [] } };
const opcoesStatus = [
    { valor: PhishingStatus.POSSIVEL_PHISHING, rotulo: '[possivel phishing]', cor: 'orange' },
    { valor: PhishingStatus.NECESSARIO_ANALISE, rotulo: '[necessario analise]', cor: 'blue' },
    { valor: PhishingStatus.PHISHING_IDENTIFICADO, rotulo: '[phishing identificado]', cor: 'red' },
    { valor: PhishingStatus.FALSO_POSITIVO, rotulo: '[falso positivo]', cor: 'green' },
    { valor: PhishingStatus.NECESSARIO_REANALISE, rotulo: '[necessario reanalise]', cor: 'gold' },
];

const formatarData = (valor: string) => new Date(valor).toLocaleString('pt-BR');
const obterInfoStatus = (status?: PhishingStatus) => opcoesStatus.find((item) => item.valor === status) || opcoesStatus[1];

const PhishingView = () => {
    const { projeto } = useStore();
    const projetoId = projeto?.get()?.id;
    const [dominios, setDominios] = useState<Dominio[]>([]);
    const [dominioSelecionado, setDominioSelecionado] = useState<number | null>(null);
    const [dados, setDados] = useState<RegistroPhishing[]>([]);
    const [basePhishing, setBasePhishing] = useState<BasePhishing>(baseInicial);
    const [entradaPalavrasChave, setEntradaPalavrasChave] = useState<string[]>([]);
    const [entradaPalavrasAuxiliares, setEntradaPalavrasAuxiliares] = useState<string[]>([]);
    const [entradaTlds, setEntradaTlds] = useState<string[]>([]);
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
    const [executandoCrtsh, setExecutandoCrtsh] = useState(false);
    const [verificando, setVerificando] = useState(false);
    const [verificandoIndividuais, setVerificandoIndividuais] = useState<number[]>([]);
    const [capturandoIndividuais, setCapturandoIndividuais] = useState<number[]>([]);
    const [alterandoStatus, setAlterandoStatus] = useState<number[]>([]);
    const [modalClassificacao, setModalClassificacao] = useState<{ id: number; status: PhishingStatus } | null>(null);
    const [removendoRegistros, setRemovendoRegistros] = useState<number[]>([]);
    const [removendoOffline, setRemovendoOffline] = useState(false);
    const [modalAjuda, setModalAjuda] = useState<{ titulo: string; descricao: React.ReactNode } | null>(null);
    const [visualizacao, setVisualizacao] = useState<'tabela' | 'capturas'>('tabela');
    const [paginaCapturas, setPaginaCapturas] = useState(1);
    const [capturando, setCapturando] = useState(false);

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

    const normalizarPadraoCatcher = useCallback((entrada?: { palavras?: PalavraCatcher[]; tlds?: string[] }) => ({
        palavras: (entrada?.palavras || [])
            .map(item => ({ termo: String(item?.termo || '').toLowerCase(), peso: Math.max(1, Number(item?.peso) || 1) }))
            .filter(item => item.termo),
        tlds: (entrada?.tlds || []).map(item => String(item || '').toLowerCase()).filter(Boolean)
    }), []);

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

    useEffect(() => {
        setPaginaCapturas(1);
    }, [dados, visualizacao]);

    const carregarBase = useCallback(async (dominioId: number) => {
        if (!projetoId) return;
        setCarregandoTermos(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/termos?dominioId=${dominioId}`);
            if (!resposta.ok) throw new Error();
            const base = await resposta.json();
            setBasePhishing(base);
            setEntradaPalavrasChave(base.palavrasChave || []);
            setEntradaPalavrasAuxiliares(base.palavrasAuxiliares || []);
            setEntradaTlds(base.tlds || []);
        } catch {
            message.error('Não foi possível carregar as palavras e TLDs.');
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
            setConfiguracaoCatcher({
                palavras: configuracao.palavras || [],
                tlds: configuracao.tlds || [],
                padrao: normalizarPadraoCatcher(configuracao.padrao)
            });
        } catch {
            message.error('Não foi possível carregar a configuração do phishing_catcher.');
        } finally {
            setCarregandoConfiguracao(false);
        }
    }, [normalizarPadraoCatcher, projetoId]);

    const atualizarStatus = async (id: number, status: PhishingStatus) => {
        if (!projetoId) return;
        setAlterandoStatus((lista) => [...lista, id]);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (!resposta.ok) throw new Error();
            const atualizado = await resposta.json();
            setDados((lista) => lista.map((item) => item.id === id ? { ...item, status: atualizado.status } : item));
            setModalClassificacao((atual) => atual?.id === id ? null : atual);
            message.success('Status atualizado.');
        } catch {
            message.error('Não foi possível atualizar o status.');
        } finally {
            setAlterandoStatus((lista) => lista.filter((item) => item !== id));
        }
    };

    const abrirClassificacao = (registro: RegistroPhishing) => {
        const status = registro.status || PhishingStatus.NECESSARIO_ANALISE;
        setModalClassificacao({ id: registro.id, status });
    };

    const abrirModalTermos = async () => {
        if (!dominioSelecionado) {
            message.warning('Selecione um domínio para configurar.');
            return;
        }
        setModalTermosVisivel(true);
        await carregarBase(dominioSelecionado);
    };

    const salvarTermos = async () => {
        if (!dominioSelecionado || !projetoId) return;
        setSalvandoTermos(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/termos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dominioId: dominioSelecionado, palavrasChave: entradaPalavrasChave, palavrasAuxiliares: entradaPalavrasAuxiliares, tlds: entradaTlds }),
            });
            if (!resposta.ok) throw new Error();
            const base = await resposta.json();
            setBasePhishing(base);
            setEntradaPalavrasChave(base.palavrasChave || []);
            setEntradaPalavrasAuxiliares(base.palavrasAuxiliares || []);
            setEntradaTlds(base.tlds || []);
            setModalTermosVisivel(false);
            message.success('Base atualizada.');
        } catch {
            message.error('Erro ao salvar base de termos.');
        } finally {
            setSalvandoTermos(false);
        }
    };

    const resetarBase = () => {
        const padrao = basePhishing.padrao || basePhishing;
        setEntradaPalavrasChave(padrao.palavrasChave || []);
        setEntradaPalavrasAuxiliares(padrao.palavrasAuxiliares || []);
        setEntradaTlds(padrao.tlds || []);
    };

    const executarDnstwist = async () => {
        if (!dominioSelecionado || !projetoId) {
            message.warning('Escolha um domínio alvo.');
            return;
        }
        if (!basePhishing.palavrasChave.length || !basePhishing.tlds.length) await carregarBase(dominioSelecionado);
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

    const enfileirarVerificacao = async (lista?: number[]) => {
        if (!projetoId) return;
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/verificar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: lista })
            });
            const corpo = await resposta.json();
            if (!resposta.ok) throw new Error();
            message.success(corpo.message || 'Verificação enfileirada.');
            buscarDados();
        } catch {
            message.error('Não foi possível enfileirar a verificação.');
        }
    };

    const verificarDominios = async (lista?: number[]) => {
        setVerificando(true);
        try {
            await enfileirarVerificacao(lista);
        } finally {
            setVerificando(false);
        }
    };

    const verificarRegistro = async (id: number) => {
        setVerificandoIndividuais((atual) => Array.from(new Set([...atual, id])));
        try {
            await enfileirarVerificacao([id]);
        } finally {
            setVerificandoIndividuais((atual) => atual.filter(item => item !== id));
        }
    };

    const capturarPrints = async () => {
        if (!projetoId) return;
        setCapturando(true);
        try {
            const corpo = dominioSelecionado ? { dominioId: dominioSelecionado } : {};
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/capturas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corpo)
            });
            const retorno = await resposta.json();
            if (!resposta.ok) throw new Error();
            message.success(retorno.message || 'Capturas enfileiradas.');
        } catch {
            message.error('Não foi possível enfileirar as capturas.');
        } finally {
            setCapturando(false);
        }
    };

    const capturarRegistro = async (id: number) => {
        if (!projetoId) return;
        setCapturandoIndividuais((lista) => [...lista, id]);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/capturas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id] })
            });
            const corpo = await resposta.json();
            if (!resposta.ok) throw new Error();
            message.success(corpo.message || 'Captura enfileirada.');
        } catch {
            message.error('Não foi possível enfileirar a captura.');
        } finally {
            setCapturandoIndividuais((lista) => lista.filter((item) => item !== id));
        }
    };

    const removerDominiosOffline = async () => {
        if (!projetoId) return;
        setRemovendoOffline(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/offline`, { method: 'DELETE' });
            const corpo = await resposta.json();
            if (!resposta.ok) throw new Error();
            message.success(corpo.message || 'Domínios removidos.');
            buscarDados();
        } catch {
            message.error('Não foi possível excluir domínios offline.');
        } finally {
            setRemovendoOffline(false);
        }
    };

    const removerRegistro = async (id: number) => {
        if (!projetoId) return;
        setRemovendoRegistros((lista) => [...lista, id]);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const corpo = await resposta.json();
            if (!resposta.ok) throw new Error();
            setDados((lista) => lista.filter((item) => item.id !== id));
            message.success(corpo.message || 'Registro removido.');
        } catch {
            message.error('Não foi possível remover o host.');
        } finally {
            setRemovendoRegistros((lista) => lista.filter((item) => item !== id));
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
            const { palavras, tlds } = configuracaoCatcher;
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/catcher/configuracao`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dominioId: dominioSelecionado, palavras, tlds })
            });
            if (!resposta.ok) throw new Error();
            const configuracao = await resposta.json();
            setConfiguracaoCatcher({
                palavras: configuracao.palavras || [],
                tlds: configuracao.tlds || [],
                padrao: normalizarPadraoCatcher(configuracao.padrao)
            });
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

    const executarCrtsh = async () => {
        if (!dominioSelecionado || !projetoId) {
            message.warning('Escolha um domínio alvo.');
            return;
        }
        if (!basePhishing.palavrasChave.length) await carregarBase(dominioSelecionado);
        setExecutandoCrtsh(true);
        try {
            const resposta = await fetch(`/api/v1/projetos/${projetoId}/cti/phishing/crtsh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dominioId: dominioSelecionado })
            });
            if (!resposta.ok) throw new Error();
            message.success('Consulta do crt.sh enfileirada.');
        } catch {
            message.error('Não foi possível iniciar o crt.sh.');
        } finally {
            setExecutandoCrtsh(false);
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

    const resetarConfiguracaoCatcher = () => {
        const padrao = normalizarPadraoCatcher(configuracaoCatcher.padrao);
        setConfiguracaoCatcher((atual) => ({ ...atual, palavras: padrao.palavras, tlds: padrao.tlds }));
    };

    const abrirAjuda = (titulo: string, descricao: React.ReactNode) => setModalAjuda({ titulo, descricao });

    const tituloSecao = (texto: string, onClick: () => void) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong>{texto}</Text>
            <Button type="link" size="small" icon={<InfoCircleOutlined />} onClick={onClick} />
        </div>
    );

    const totalPaginasCapturas = Math.max(1, Math.ceil(dados.length / tamanhoPaginaCapturas));
    const paginaNormalizada = Math.min(paginaCapturas, totalPaginasCapturas);
    const registrosPaginados = dados.slice((paginaNormalizada - 1) * tamanhoPaginaCapturas, paginaNormalizada * tamanhoPaginaCapturas);

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
            render: (valor: string) => <Text>{valor}</Text>
        },
        {
            title: 'Fonte',
            dataIndex: 'fonte',
            key: 'fonte',
            render: (valor: string) => <Text strong>{valor.toUpperCase()}</Text>
        },
        {
            title: 'Classificação',
            dataIndex: 'status',
            key: 'status',
            render: (_: string, registro: RegistroPhishing) => {
                const info = obterInfoStatus(registro.status);
                return (
                    <Tag color={info.cor}>{info.rotulo}</Tag>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'statusUltimaVerificacao',
            key: 'statusUltimaVerificacao',
            render: (_: string, registro: RegistroPhishing) => registro.statusUltimaVerificacao ? (
                <Space direction="vertical" size={2}>
                    <Tag color={registro.statusUltimaVerificacao === 'ONLINE' ? 'red' : 'green'}>
                        {registro.statusUltimaVerificacao}
                    </Tag>
                    {registro.ultimaVerificacao && <Text type="secondary" style={{ fontSize: 12 }}>{formatarData(registro.ultimaVerificacao)}</Text>}
                </Space>
            ) : '-'
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
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_: string, registro: RegistroPhishing) => (
                <Space size={6}>
                    <Tooltip title="Capturar imagem">
                        <Button
                            size="small"
                            icon={<PictureOutlined />}
                            loading={capturandoIndividuais.includes(registro.id)}
                            onClick={() => capturarRegistro(registro.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Verificar">
                        <Button
                            size="small"
                            icon={<SecurityScanOutlined />}
                            loading={verificando || verificandoIndividuais.includes(registro.id)}
                            onClick={() => verificarRegistro(registro.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Alterar classificação">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => abrirClassificacao(registro)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Remover host?"
                        okText="Remover"
                        cancelText="Cancelar"
                        onConfirm={() => removerRegistro(registro.id)}
                    >
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            loading={removendoRegistros.includes(registro.id)}
                        />
                    </Popconfirm>
                </Space>
            )
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
                        <Space wrap>
                            <Segmented
                                value={visualizacao}
                                onChange={(valor) => setVisualizacao(valor as 'tabela' | 'capturas')}
                                options={[
                                    { label: 'Tabela', value: 'tabela', icon: <TableOutlined /> },
                                    { label: 'Capturas', value: 'capturas', icon: <AppstoreOutlined /> }
                                ]}
                            />
                            <Button icon={<PictureOutlined />} onClick={capturarPrints} loading={capturando} disabled={!dados.length}>
                                Capturar prints
                            </Button>
                            <Button icon={<ReloadOutlined />} onClick={buscarDados} loading={carregando}>Atualizar</Button>
                            <Button icon={<SecurityScanOutlined />} onClick={() => verificarDominios()} loading={verificando} disabled={!dados.length}>
                                Verificar todos
                            </Button>
                            <Button danger icon={<MinusCircleOutlined />} onClick={removerDominiosOffline} loading={removendoOffline} disabled={!dados.some((item) => item.statusUltimaVerificacao === 'OFFLINE')}>
                                Excluir offline
                            </Button>
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
                                    carregarBase(valor);
                                    carregarConfiguracaoCatcher(valor);
                                } else {
                                    setBasePhishing(baseInicial);
                                    setEntradaPalavrasChave([]);
                                    setEntradaPalavrasAuxiliares([]);
                                    setEntradaTlds([]);
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
                    {visualizacao === 'tabela' ? (
                        <Table
                            dataSource={dados}
                            columns={colunas}
                            rowKey="id"
                            loading={carregando}
                            pagination={{ pageSize: 8 }}
                            scroll={{ x: true }}
                        />
                    ) : (
                        <PainelVisualizacao>
                            {dados.length ? (
                                <>
                                    <GradeCapturas>
                                        {registrosPaginados.map((registro) => {
                                            const status = obterInfoStatus(registro.status);
                                            const imagem = registro.captura ? (
                                                <Image
                                                    src={registro.captura}
                                                    alt={registro.alvo}
                                                    style={{ height: 220, objectFit: 'cover' }}
                                                    preview={false}
                                                />
                                            ) : <LugarImagem>Sem captura</LugarImagem>;

                                            return (
                                                <Card
                                                    key={registro.id}
                                                    cover={imagem}
                                                    title={registro.alvo}
                                                    extra={<Tag color={status.cor}>{status.rotulo}</Tag>}
                                                >
                                                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                                        <Space size={6} wrap>
                                                            <Tag color="purple">{registro.termo}</Tag>
                                                            <Tag>{registro.fonte.toUpperCase()}</Tag>
                                                            {registro.statusUltimaVerificacao && (
                                                                <Tag color={registro.statusUltimaVerificacao === 'ONLINE' ? 'red' : 'green'}>
                                                                    {registro.statusUltimaVerificacao}
                                                                </Tag>
                                                            )}
                                                        </Space>
                                                        <Space size={6} wrap>
                                                            <Tag color="blue">{registro.dominio.endereco}</Tag>
                                                            {registro.capturadoEm && <Tag color="gold">Capturado {formatarData(registro.capturadoEm)}</Tag>}
                                                        </Space>
                                                        <RodapeCartao>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>Detectado {formatarData(registro.criadoEm)}</Text>
                                                            {registro.captura && <a href={registro.captura} target="_blank" rel="noreferrer">Abrir imagem</a>}
                                                        </RodapeCartao>
                                                    </Space>
                                                </Card>
                                            );
                                        })}
                                    </GradeCapturas>
                                    {dados.length > tamanhoPaginaCapturas && (
                                        <Pagination
                                            current={paginaNormalizada}
                                            pageSize={tamanhoPaginaCapturas}
                                            total={dados.length}
                                            onChange={(pagina) => setPaginaCapturas(pagina)}
                                            showSizeChanger={false}
                                        />
                                    )}
                                </>
                            ) : (
                                <Empty description="Nenhum registro de phishing" />
                            )}
                        </PainelVisualizacao>
                    )}
                </Cartao>

                <Cartao>
                    <Cabecalho>
                        <BlocoTitulo>
                            <Title level={5} style={{ margin: 0 }}>Detecção ativa</Title>
                        </BlocoTitulo>
                        <Space>
                            <Button icon={<SettingOutlined />} onClick={abrirModalTermos}>Configurar base</Button>
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
                                    Chaves ({basePhishing.palavrasChave.length || '-'}) / Auxiliares ({basePhishing.palavrasAuxiliares.length || '-'}) / TLDs ({basePhishing.tlds.length || '-'})
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
                    <PainelFerramenta>
                        <IconeFerramenta>
                            <SecurityScanOutlined />
                        </IconeFerramenta>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                <div>
                                    <Text strong>crt.sh</Text>
                                    <div><Text type="secondary">Busca certificados com nomes próximos e adiciona novos alvos.</Text></div>
                                </div>
                            </div>
                            <AcoesFerramenta>
                                <Button icon={<SettingOutlined />} onClick={abrirModalTermos}>
                                    Chaves ({basePhishing.palavrasChave.length || '-'})
                                </Button>
                                <Button type="primary" icon={<SecurityScanOutlined />} loading={executandoCrtsh} onClick={executarCrtsh}>
                                    Consultar certificados
                                </Button>
                            </AcoesFerramenta>
                        </div>
                    </PainelFerramenta>
                    <Alert
                        message="Dicas"
                        description="Personalize palavras e TLDs antes de rodar para cobrir variações de marca, departamentos e iscas comuns."
                        type="info"
                        showIcon
                    />
                </Cartao>
            </Grade>

            <Modal
                title="Base de phishing"
                open={modalTermosVisivel}
                onCancel={() => setModalTermosVisivel(false)}
                footer={[
                    <Button key="reset" onClick={resetarBase}>Resetar</Button>,
                    <Button key="cancel" onClick={() => setModalTermosVisivel(false)}>Cancelar</Button>,
                    <Button key="submit" type="primary" loading={salvandoTermos} onClick={salvarTermos}>Salvar base</Button>
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text type="secondary">Edite palavras-chave, auxiliares e TLDs usados nas buscas.</Text>
                    {carregandoTermos ? (
                        <Skeleton active paragraph={{ rows: 5 }} />
                    ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Palavras-chave</Text>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                value={entradaPalavrasChave}
                                onChange={valor => setEntradaPalavrasChave(valor)}
                                tokenSeparators={[',', ' ']}
                                placeholder="Insira palavras-chave e pressione enter"
                            />
                            <Text strong>Palavras auxiliares</Text>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                value={entradaPalavrasAuxiliares}
                                onChange={valor => setEntradaPalavrasAuxiliares(valor)}
                                tokenSeparators={[',', ' ']}
                                placeholder="Insira palavras auxiliares e pressione enter"
                            />
                            <Text strong>TLDs</Text>
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                value={entradaTlds}
                                onChange={valor => setEntradaTlds(valor)}
                                tokenSeparators={[',', ' ']}
                                placeholder="Insira TLDs e pressione enter"
                            />
                        </Space>
                    )}
                    <Divider style={{ margin: '8px 0' }} />
                    <Text strong>Pré-visualização</Text>
                    {carregandoTermos ? <Skeleton active paragraph={{ rows: 3 }} /> : (
                        <ListaTermos>
                            {entradaPalavrasChave.map((termo) => <Tag key={termo} color="purple">{termo}</Tag>)}
                            {entradaPalavrasAuxiliares.map((termo) => <Tag key={`aux-${termo}`} color="magenta">{termo}</Tag>)}
                            {entradaTlds.map((tld) => <Tag key={tld} color="blue">.{tld}</Tag>)}
                            {!entradaPalavrasChave.length && !entradaPalavrasAuxiliares.length && !entradaTlds.length && <Text type="secondary">Nenhuma base definida.</Text>}
                        </ListaTermos>
                    )}
                </Space>
            </Modal>

            <Modal
                title="Configuração do phishing_catcher"
                open={modalConfiguracaoCatcher}
                onCancel={() => setModalConfiguracaoCatcher(false)}
                footer={[
                    <Button key="reset" onClick={resetarConfiguracaoCatcher}>Resetar</Button>,
                    <Button key="cancel" onClick={() => setModalConfiguracaoCatcher(false)}>Cancelar</Button>,
                    <Button key="save" type="primary" loading={salvandoConfiguracao} onClick={salvarConfiguracaoCatcher}>Salvar configuração</Button>
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    {tituloSecao('Palavras-chave monitoradas', () => abrirAjuda('Palavras-chave monitoradas', (
                        <Space direction="vertical">
                            <Text>Itens usados para pontuar nomes parecidos; cada palavra aumenta o score conforme o peso definido.</Text>
                            <Text>Adicionar mais palavras amplia a cobertura, enquanto remover reduz alertas para aquela marca.</Text>
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
                title="Alterar classificação"
                open={!!modalClassificacao}
                onCancel={() => setModalClassificacao(null)}
                onOk={() => modalClassificacao && atualizarStatus(modalClassificacao.id, modalClassificacao.status)}
                confirmLoading={modalClassificacao ? alterandoStatus.includes(modalClassificacao.id) : false}
                okText="Atualizar"
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text type="secondary">Selecione a classificação desejada.</Text>
                    <Select
                        value={modalClassificacao?.status || PhishingStatus.NECESSARIO_ANALISE}
                        onChange={(valor) => setModalClassificacao((atual) => atual ? { ...atual, status: valor as PhishingStatus } : atual)}
                        options={opcoesStatus.map((item) => ({ value: item.valor, label: item.rotulo }))}
                    />
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
