'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button, Table, Typography, Space, Select, Tag, message, Modal, Divider, Tooltip, Skeleton, Input, InputNumber, Row, Col, Popconfirm, Segmented, Image, Empty, Flex } from 'antd';
import styled from 'styled-components';
import { useStore } from '@/hooks/useStore';
import { Dominio, PhishingStatus } from '@prisma/client';
import { RadarChartOutlined, ReloadOutlined, SettingOutlined, ThunderboltOutlined, SafetyOutlined, InfoCircleOutlined, PlusOutlined, MinusCircleOutlined, SecurityScanOutlined, EditOutlined, DeleteOutlined, PictureOutlined, AppstoreOutlined, TableOutlined, RightOutlined, LeftOutlined, FilterOutlined, EyeOutlined, GlobalOutlined, ClockCircleOutlined, TagOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const tamanhoPaginaCapturas = 8;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px 0;
  width: 100%;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Cartao = styled.div`
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borders.radius};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CabecalhoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const BlocoTitulo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BarraFerramentas = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const GradeFerramentas = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
`;

const CartaoFerramenta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borders.radius};
  background: ${({ theme }) => theme.glass.default};
  height: 100%;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.glass.card};
    transform: translateY(-2px);
  }
`;

const HeaderFerramenta = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const IconeFerramenta = styled.div`
  min-width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}22, ${({ theme }) => theme.colors.primary}55);
  color: ${({ theme }) => theme.colors.primary};
  font-size: 22px;
`;

const AcoesFerramenta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
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
  gap: 16px;
`;

const GradeCapturas = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 16px;
  width: 100%;
`;

const CarrosselContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const BotaoNavegacao = styled(Button)`
  height: 100%;
  min-height: 240px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: ${({ theme }) => theme.glass.default};
  border-radius: ${({ theme }) => theme.borders.radius};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.glass.card} !important;
    color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
  }
`;

const CartaoCaptura = styled.div`
  position: relative;
  height: 240px;
  width: 100%;
  border-radius: ${({ theme }) => theme.borders.radius};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background: #000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 10px 30px -10px ${({ theme }) => theme.colors.primary}44;

    .overlay-info {
      transform: translateY(0);
    }

    .overlay-actions {
      opacity: 1;
    }
  }
`;

const ImagemFundo = styled.div<{ $url?: string | null }>`
  width: 100%;
  height: 100%;
  background-image: ${props => props.$url ? `url(${props.$url})` : 'none'};
  background-size: cover;
  background-position: center;
  opacity: ${props => props.$url ? 0.8 : 0.4};
  transition: opacity 0.3s;
`;

const StatusBadge = styled.div<{ $color: string }>`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  background: ${({ theme }) => theme.glass.heavy};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ $color }) => $color}44;
  color: ${({ $color }) => $color};
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    box-shadow: 0 0 8px ${({ $color }) => $color};
  }
`;

const TechLabel = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InfoOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%);
  color: white;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  /* transform: translateY(6px); */
  transition: transform 0.3s;
`;

const OverlayActions = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;
`;

const TituloCard = styled.div`
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SubtituloCard = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LugarSemImagem = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.glass.heavy};
  color: ${({ theme }) => theme.colors.textSecondary};
  gap: 8px;
  font-size: 13px;
`;

interface RegistroPhishing {
    id: number;
    alvo: string;
    termo: string;
    fonte: string;
    criadoEm: string;
    ultimaVerificacao?: string;
    statusUltimaVerificacao?: 'ONLINE' | 'OFFLINE';
    dominio: { id: number; endereco: string };
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
    { valor: PhishingStatus.POSSIVEL_PHISHING, rotulo: 'Possível', cor: '#faad14' }, // Orange
    { valor: PhishingStatus.NECESSARIO_ANALISE, rotulo: 'Análise', cor: '#1890ff' }, // Blue
    { valor: PhishingStatus.PHISHING_IDENTIFICADO, rotulo: 'Phishing', cor: '#f5222d' }, // Red
    { valor: PhishingStatus.FALSO_POSITIVO, rotulo: 'Seguro', cor: '#52c41a' }, // Green
    { valor: PhishingStatus.NECESSARIO_REANALISE, rotulo: 'Reanálise', cor: '#faad14' }, // Gold
];
const opcoesStatusVerificacao = [
    { valor: 'ONLINE', rotulo: 'Online', cor: '#52c41a' },
    { valor: 'OFFLINE', rotulo: 'Offline', cor: '#f5222d' }
];

const formatarData = (valor: string) => new Date(valor).toLocaleString('pt-BR');
const obterInfoStatus = (status?: PhishingStatus) => opcoesStatus.find((item) => item.valor === status) || opcoesStatus[1];
const obterInfoStatusVerificacao = (status?: 'ONLINE' | 'OFFLINE') => opcoesStatusVerificacao.find((item) => item.valor === status) || { valor: 'INDEFINIDO', rotulo: 'Sem verificação', cor: '#1890ff' };

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

    // Filtrar dados localmente com base no domínio selecionado
    const dadosFiltrados = dominioSelecionado
        ? dados.filter(item => item.dominio.id === dominioSelecionado)
        : dados;

    useEffect(() => {
        setPaginaCapturas(1);
    }, [dadosFiltrados, visualizacao]);

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

    const abrirModalCaptura = (url?: string | null) => {
        if (url) setCapturaSelecionada(url);
    };

    const fecharModalCaptura = () => setCapturaSelecionada(null);

    const montarLinkDominio = (alvo: string) => alvo.startsWith('http') ? alvo : `http://${alvo}`;

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

    const totalPaginasCapturas = Math.max(1, Math.ceil(dadosFiltrados.length / tamanhoPaginaCapturas));
    const paginaNormalizada = Math.min(paginaCapturas, totalPaginasCapturas);
    const registrosPaginados = dadosFiltrados.slice((paginaNormalizada - 1) * tamanhoPaginaCapturas, paginaNormalizada * tamanhoPaginaCapturas);

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

    const avancarPagina = () => {
        if (paginaNormalizada < totalPaginasCapturas) {
            setPaginaCapturas(paginaNormalizada + 1);
        } else {
            setPaginaCapturas(1);
        }
    };

    const voltarPagina = () => {
        if (paginaNormalizada > 1) {
            setPaginaCapturas(paginaNormalizada - 1);
        } else {
            setPaginaCapturas(totalPaginasCapturas);
        }
    };

    return (
        <Container>
            <Section>
                <Cartao>
                    <CabecalhoSection>
                        <BlocoTitulo>
                            <Title level={4} style={{ margin: 0 }}>Monitoramento</Title>
                            <Text type="secondary">Resultados das varreduras de phishing.</Text>
                        </BlocoTitulo>
                        <Flex gap={16} align="center">
                            <Segmented
                                value={visualizacao}
                                onChange={(valor) => setVisualizacao(valor as 'tabela' | 'capturas')}
                                options={[
                                    { value: 'tabela', icon: <Tooltip title="Visualizar Tabela"><TableOutlined /></Tooltip> },
                                    { value: 'capturas', icon: <Tooltip title="Visualizar Imagens"><AppstoreOutlined /></Tooltip> }
                                ]}
                            />
                            <Space size={8}>
                                <Tooltip title="Atualizar dados">
                                    <Button icon={<ReloadOutlined />} onClick={buscarDados} loading={carregando} />
                                </Tooltip>
                                <Tooltip title="Capturar prints agora">
                                    <Button icon={<PictureOutlined />} onClick={capturarPrints} loading={capturando} disabled={!dados.length} />
                                </Tooltip>
                                <Tooltip title="Verificar status">
                                    <Button icon={<SecurityScanOutlined />} onClick={() => verificarDominios()} loading={verificando} disabled={!dados.length} />
                                </Tooltip>
                                <Tooltip title="Excluir offline">
                                    <Button danger icon={<MinusCircleOutlined />} onClick={removerDominiosOffline} loading={removendoOffline} disabled={!dados.some((item) => item.statusUltimaVerificacao === 'OFFLINE')} />
                                </Tooltip>
                                <Tooltip title="Limpar histórico">
                                    <Button danger icon={<DeleteOutlined />} onClick={limparDados} disabled={carregando || !dados.length} />
                                </Tooltip>
                            </Space>
                        </Flex>
                    </CabecalhoSection>

                    {visualizacao === 'tabela' ? (
                        <Table
                            dataSource={dadosFiltrados}
                            columns={colunas}
                            rowKey="id"
                            loading={carregando}
                            pagination={{ pageSize: 8 }}
                            scroll={{ x: true }}
                            locale={{ emptyText: <Empty description="Nenhum resultado encontrado" /> }}
                        />
                    ) : (
                        <PainelVisualizacao>
                            {dadosFiltrados.length ? (
                                <CarrosselContainer>
                                    <BotaoNavegacao onClick={voltarPagina}>
                                        <LeftOutlined style={{ fontSize: 24 }} />
                                    </BotaoNavegacao>

                                    <div style={{ flex: 1 }}>
                                        <GradeCapturas>
                                            {registrosPaginados.map((registro) => {
                                                const statusVerificacao = obterInfoStatusVerificacao(registro.statusUltimaVerificacao);
                                                const infoStatus = obterInfoStatus(registro.status);
                                                const urlCaptura = resolverUrlCaptura(registro.captura);
                                                const podeVisualizar = Boolean(registro.captura && urlCaptura);

                                                return (
                                                    <CartaoCaptura key={registro.id} onClick={() => podeVisualizar && abrirModalCaptura(urlCaptura)}>
                                                        <ImagemFundo $url={urlCaptura} />

                                                        {registro.captura ? (
                                                            <OverlayActions className="overlay-actions">
                                                                <Button
                                                                    shape="circle"
                                                                    icon={<EyeOutlined />}
                                                                    size="large"
                                                                    type="primary"
                                                                    ghost
                                                                    style={{ backdropFilter: 'blur(4px)' }}
                                                                    onClick={(evento) => { evento.stopPropagation(); abrirModalCaptura(urlCaptura); }}
                                                                />
                                                            </OverlayActions>
                                                        ) : (
                                                            <LugarSemImagem className="overlay-actions" style={{ opacity: 1, background: 'rgba(0,0,0,0.8)' }}>
                                                                <PictureOutlined style={{ fontSize: 24 }} />
                                                                <span>Sem captura</span>
                                                            </LugarSemImagem>
                                                        )}

                                                        <TechLabel>
                                                            <TagOutlined />
                                                            {statusVerificacao.rotulo}
                                                        </TechLabel>

                                                        <StatusBadge $color={infoStatus.cor}>
                                                            {infoStatus.rotulo}
                                                        </StatusBadge>

                                                        <InfoOverlay className="overlay-info">
                                                            <TituloCard>
                                                                <GlobalOutlined />
                                                                <a href={montarLinkDominio(registro.alvo)} target="_blank" rel="noreferrer" onClick={(evento) => evento.stopPropagation()} style={{ color: 'white' }}>
                                                                    {registro.alvo}
                                                                </a>
                                                            </TituloCard>
                                                            <SubtituloCard>
                                                                <ClockCircleOutlined />
                                                                {formatarData(registro.criadoEm)}
                                                            </SubtituloCard>
                                                        </InfoOverlay>
                                                    </CartaoCaptura>
                                                );
                                            })}
                                        </GradeCapturas>
                                    </div>

                                    <BotaoNavegacao onClick={avancarPagina}>
                                        <RightOutlined style={{ fontSize: 24 }} />
                                    </BotaoNavegacao>
                                </CarrosselContainer>
                            ) : (
                                <Empty description="Nenhum resultado para exibir" />
                            )}
                        </PainelVisualizacao>
                    )}
                </Cartao>
            </Section>

            <Section>
                <CabecalhoSection>
                    <BlocoTitulo>
                        <Title level={4} style={{ margin: 0 }}>Detecção Ativa</Title>
                        <Text type="secondary">Ferramentas para descoberta de novos hosts e certificados.</Text>
                    </BlocoTitulo>
                    <BarraFerramentas>
                        <Text strong>Domínio Alvo:</Text>
                        <Select
                            style={{ width: 280 }}
                            placeholder="Selecione um domínio"
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
                            suffixIcon={<FilterOutlined />}
                        >
                            {dominios.map(dominio => <Option key={dominio.id} value={dominio.id}>{dominio.endereco}</Option>)}
                        </Select>
                        <Tooltip title="Recarregar lista de domínios">
                            <Button icon={<ReloadOutlined />} onClick={buscarDominios} />
                        </Tooltip>
                    </BarraFerramentas>
                </CabecalhoSection>

                <GradeFerramentas>
                    <CartaoFerramenta>
                        <HeaderFerramenta>
                            <IconeFerramenta>
                                <ThunderboltOutlined />
                            </IconeFerramenta>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Text strong style={{ fontSize: 16 }}>dnstwist</Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>Gera permutações de domínio (lookalikes) e valida resolução DNS.</Text>
                            </div>
                        </HeaderFerramenta>
                        <AcoesFerramenta>
                            <Button onClick={abrirModalTermos} icon={<SettingOutlined />}>
                                Configurar
                            </Button>
                            <Button type="primary" icon={<RadarChartOutlined />} loading={executando} onClick={executarDnstwist} block disabled={!dominioSelecionado}>
                                Executar
                            </Button>
                        </AcoesFerramenta>
                    </CartaoFerramenta>

                    <CartaoFerramenta>
                        <HeaderFerramenta>
                            <IconeFerramenta>
                                <SafetyOutlined />
                            </IconeFerramenta>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Text strong style={{ fontSize: 16 }}>phishing_catcher</Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>Monitoramento em tempo real baseado em pontuação de palavras-chave.</Text>
                            </div>
                        </HeaderFerramenta>
                        <AcoesFerramenta>
                            <Button icon={<SettingOutlined />} onClick={abrirConfiguracaoCatcher}>
                                Ajustar
                            </Button>
                            <Button type="primary" icon={<ThunderboltOutlined />} loading={executandoCatcher} onClick={executarPhishingCatcher} block disabled={!dominioSelecionado}>
                                Consultar
                            </Button>
                        </AcoesFerramenta>
                    </CartaoFerramenta>

                    <CartaoFerramenta>
                        <HeaderFerramenta>
                            <IconeFerramenta>
                                <SecurityScanOutlined />
                            </IconeFerramenta>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Text strong style={{ fontSize: 16 }}>crt.sh</Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>Busca em logs de transparência de certificados por subdomínios e similares.</Text>
                            </div>
                        </HeaderFerramenta>
                        <AcoesFerramenta>
                            <Button icon={<SettingOutlined />} onClick={abrirModalTermos}>
                                Chaves
                            </Button>
                            <Button type="primary" icon={<SecurityScanOutlined />} loading={executandoCrtsh} onClick={executarCrtsh} block disabled={!dominioSelecionado}>
                                Buscar
                            </Button>
                        </AcoesFerramenta>
                    </CartaoFerramenta>
                </GradeFerramentas>
            </Section>

            <Modal open={Boolean(capturaSelecionada)} onCancel={fecharModalCaptura} footer={null} centered width={900} bodyStyle={{ padding: 0, background: '#000' }}>
                {capturaSelecionada && <Image src={capturaSelecionada} alt="Captura de phishing" preview={false} style={{ width: '100%', borderRadius: 12 }} />}
            </Modal>

            {/* Modais permanecem inalterados na lógica, apenas renderizados aqui */}
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
