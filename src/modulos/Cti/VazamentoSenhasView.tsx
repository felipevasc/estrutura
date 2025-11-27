'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Space, Table, Tag, Tooltip, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useStore } from '@/hooks/useStore';
import { FonteVazamento, TipoFonteVazamento, useFontesVazamento } from '@/api/cti/fontesVazamento';
import { useBuscaAtivaTelegram } from '@/api/cti/buscaAtivaTelegram';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
`;

const Cabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Painel = styled(Card)`
  height: 100%;
`;

const Destaque = styled(Card)`
  background: #f7f8fc;
`;

type CampoParametro = {
    chave: string;
    rotulo: string;
    tipo?: 'numero' | 'tags' | 'opcao';
    opcoes?: { label: string; value: string }[];
    obrigatorio?: boolean;
};

const tiposFonte: { valor: TipoFonteVazamento; rotulo: string; cor: string }[] = [
    { valor: 'TELEGRAM', rotulo: 'Telegram', cor: 'blue' },
    { valor: 'FORUM_SURFACE', rotulo: 'Fóruns Surface', cor: 'green' },
    { valor: 'FORUM_DARKWEB', rotulo: 'Fóruns Dark Web', cor: 'purple' },
];

const camposPorTipo: Record<TipoFonteVazamento, CampoParametro[]> = {
    TELEGRAM: [
        { chave: 'tokenBot', rotulo: 'Token do bot', obrigatorio: true },
        { chave: 'canalOuGrupo', rotulo: 'Canal ou grupo', obrigatorio: true },
        { chave: 'idGrupo', rotulo: 'ID do grupo/canal', obrigatorio: true },
        {
            chave: 'estrategiaDownload',
            rotulo: 'Estratégia de captura',
            obrigatorio: true,
            tipo: 'opcao',
            opcoes: [
                { label: 'Arquivos e mídias', value: 'arquivos' },
                { label: 'Mensagens e links', value: 'mensagens' },
            ],
        },
        { chave: 'intervaloMinutos', rotulo: 'Intervalo de varredura (min)', obrigatorio: true, tipo: 'numero' },
        { chave: 'limiteArquivos', rotulo: 'Limite de arquivos por ciclo', obrigatorio: true, tipo: 'numero' },
    ],
    FORUM_SURFACE: [
        { chave: 'url', rotulo: 'URL base', obrigatorio: true },
        { chave: 'credenciais', rotulo: 'Credenciais ou token' },
        { chave: 'palavrasChave', rotulo: 'Palavras-chave', tipo: 'tags' },
        { chave: 'frequenciaMinutos', rotulo: 'Frequência de coleta (min)', obrigatorio: true, tipo: 'numero' },
    ],
    FORUM_DARKWEB: [
        { chave: 'endereco', rotulo: 'Endereço ou onion', obrigatorio: true },
        { chave: 'proxy', rotulo: 'Proxy ou gateway de saída', obrigatorio: true },
        { chave: 'chaveAcesso', rotulo: 'Chave de acesso ou cookie' },
        { chave: 'frequenciaMinutos', rotulo: 'Frequência de coleta (min)', obrigatorio: true, tipo: 'numero' },
    ],
};

const rotuloTipo = (tipo: TipoFonteVazamento) => tiposFonte.find((t) => t.valor === tipo)?.rotulo || tipo;

const corTipo = (tipo: TipoFonteVazamento) => tiposFonte.find((t) => t.valor === tipo)?.cor;

const ajudaCampos: Record<string, string> = {
    tokenBot:
        'Crie um bot com @BotFather usando /newbot, copie o token HTTP retornado e, se for coletar mensagens em grupo, desative a privacidade com /setprivacy.',
    idGrupo:
        'Adicione o bot ao grupo ou canal, envie uma mensagem e use um bot como @RawDataBot/@getidsbot para ler o chat_id (começa com -100 em grupos).',
};

const resumoParametros = (fonte: FonteVazamento) => {
    const { parametros, tipo } = fonte;
    if (tipo === 'TELEGRAM') {
        const alvo = parametros.canalOuGrupo || 'Canal não definido';
        const estrategia = parametros.estrategiaDownload === 'mensagens' ? 'mensagens' : 'arquivos';
        const identificador = parametros.idGrupo ? ` • ID ${parametros.idGrupo}` : '';
        return `${alvo} • ${estrategia}${identificador}`;
    }
    if (tipo === 'FORUM_SURFACE') {
        const url = parametros.url || 'URL não definida';
        const frequencia = parametros.frequenciaMinutos ? `${parametros.frequenciaMinutos} min` : 'Frequência pendente';
        return `${url} • ${frequencia}`;
    }
    const endereco = parametros.endereco || 'Endereço não definido';
    const frequencia = parametros.frequenciaMinutos ? `${parametros.frequenciaMinutos} min` : 'Frequência pendente';
    return `${endereco} • ${frequencia}`;
};

const normalizarParametros = (tipo: TipoFonteVazamento, parametros: Record<string, unknown>) => {
    const campos = camposPorTipo[tipo];
    const resultado: Record<string, unknown> = {};
    campos.forEach((campo) => {
        const valor = parametros ? parametros[campo.chave] : undefined;
        if (campo.tipo === 'tags') {
            resultado[campo.chave] = Array.isArray(valor) ? valor : valor ? [valor] : [];
        } else if (campo.tipo === 'numero') {
            resultado[campo.chave] = valor !== undefined && valor !== null ? Number(valor) : undefined;
        } else {
            resultado[campo.chave] = valor;
        }
    });
    return resultado;
};

const VazamentoSenhasView = () => {
    const { projeto } = useStore();
    const projetoId = projeto?.get()?.id;
    const { fontes, isLoading, criarFonte, atualizarFonte, removerFonte, recarregarFontes } = useFontesVazamento(projetoId);
    const { registros: buscasTelegram, isLoading: carregandoBusca, salvarPreferencias, executarColeta, recarregar: recarregarBuscas } = useBuscaAtivaTelegram(projetoId);
    const [filtroTipo, setFiltroTipo] = useState<TipoFonteVazamento | 'TODOS'>('TODOS');
    const [modalAberto, setModalAberto] = useState(false);
    const [fonteEdicao, setFonteEdicao] = useState<FonteVazamento | null>(null);
    const [modalColetaAberto, setModalColetaAberto] = useState(false);
    const [fonteColeta, setFonteColeta] = useState<FonteVazamento | null>(null);
    const [form] = Form.useForm();
    const [formColeta] = Form.useForm();
    const tipoSelecionado = (Form.useWatch('tipo', form) as TipoFonteVazamento) || 'TELEGRAM';

    useEffect(() => {
        if (fonteEdicao) {
            form.setFieldsValue({
                nome: fonteEdicao.nome,
                tipo: fonteEdicao.tipo,
                observacoes: fonteEdicao.observacoes,
                parametros: fonteEdicao.parametros,
            });
        } else {
            form.setFieldsValue({ tipo: 'TELEGRAM', parametros: {} });
        }
    }, [fonteEdicao, form]);

    const dadosTabela = useMemo(() => {
        if (filtroTipo === 'TODOS') return fontes;
        return fontes.filter((fonte) => fonte.tipo === filtroTipo);
    }, [fontes, filtroTipo]);

    const totaisPorTipo = useMemo(() => {
        return tiposFonte.map((tipo) => ({
            ...tipo,
            quantidade: fontes.filter((fonte) => fonte.tipo === tipo.valor).length,
        }));
    }, [fontes]);

    const fontesTelegram = useMemo(() => fontes.filter((fonte) => fonte.tipo === 'TELEGRAM'), [fontes]);

    const linhasBuscaTelegram = useMemo(() => {
        return fontesTelegram.map((fonte) => ({
            fonte,
            registro: buscasTelegram.find((registro) => registro.fonteId === fonte.id),
        }));
    }, [buscasTelegram, fontesTelegram]);

    const abrirModalCriacao = () => {
        setFonteEdicao(null);
        setModalAberto(true);
    };

    const abrirModalEdicao = (fonte: FonteVazamento) => {
        setFonteEdicao(fonte);
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setFonteEdicao(null);
        form.resetFields();
    };

    const abrirModalColeta = (fonte: FonteVazamento) => {
        setFonteColeta(fonte);
        const registro = buscasTelegram.find((item) => item.fonteId === fonte.id);
        formColeta.setFieldsValue({
            extensoes: registro?.extensoes || [],
            ultimaCapturaSucesso: registro?.ultimaCapturaSucesso ? dayjs(registro.ultimaCapturaSucesso) : null,
            destinoCentral: registro?.destinoCentral || '',
        });
        setModalColetaAberto(true);
    };

    const fecharModalColeta = () => {
        setModalColetaAberto(false);
        setFonteColeta(null);
        formColeta.resetFields();
    };

    const salvarFonte = async () => {
        const valores = await form.validateFields();
        const parametros = normalizarParametros(valores.tipo, valores.parametros || {});
        const payload = {
            nome: valores.nome,
            tipo: valores.tipo as TipoFonteVazamento,
            parametros,
            observacoes: valores.observacoes,
            projetoId,
        };
        if (fonteEdicao) {
            await atualizarFonte({ ...payload, id: fonteEdicao.id });
        } else {
            await criarFonte(payload as Omit<FonteVazamento, 'id' | 'criadoEm' | 'atualizadoEm'>);
        }
        fecharModal();
    };

    const salvarConfiguracaoColeta = async () => {
        if (!fonteColeta) return;
        const valores = await formColeta.validateFields();
        await salvarPreferencias({
            fonteId: fonteColeta.id,
            extensoes: valores.extensoes,
            ultimaCapturaSucesso: valores.ultimaCapturaSucesso ? valores.ultimaCapturaSucesso.toISOString() : null,
            destinoCentral: valores.destinoCentral,
        });
        fecharModalColeta();
        recarregarBuscas();
    };

    const dispararColeta = async (fonte: FonteVazamento) => {
        const registro = buscasTelegram.find((item) => item.fonteId === fonte.id);
        if (!registro) {
            message.error('Configure extensões e data antes de coletar');
            return;
        }
        await executarColeta(fonte.id);
    };

    const colunas = [
        { title: 'Nome', dataIndex: 'nome', key: 'nome' },
        {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            render: (tipo: TipoFonteVazamento) => <Tag color={corTipo(tipo)}>{rotuloTipo(tipo)}</Tag>,
        },
        {
            title: 'Parâmetros principais',
            key: 'parametros',
            render: (_: unknown, fonte: FonteVazamento) => <Text type="secondary">{resumoParametros(fonte)}</Text>,
        },
        {
            title: 'Atualizado em',
            dataIndex: 'atualizadoEm',
            key: 'atualizadoEm',
            render: (valor: string) => new Date(valor).toLocaleString(),
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_: unknown, fonte: FonteVazamento) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => abrirModalEdicao(fonte)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => removerFonte(fonte.id)} />
                </Space>
            ),
        },
    ];

    const colunasTelegram = [
        {
            title: 'Grupo ou canal',
            key: 'fonte',
            render: ({ fonte }: (typeof linhasBuscaTelegram)[number]) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{fonte.nome}</Text>
                    <Text type="secondary">{fonte.parametros?.canalOuGrupo}</Text>
                </Space>
            ),
        },
        {
            title: 'Extensões alvo',
            key: 'extensoes',
            render: ({ registro }: (typeof linhasBuscaTelegram)[number]) => {
                const extensoes = (registro?.extensoes as string[] | undefined) || [];
                if (extensoes.length === 0) return <Tag color="default">Definir extensões</Tag>;
                return (
                    <Space wrap>
                        {extensoes.map((extensao) => (
                            <Tag key={extensao}>{extensao}</Tag>
                        ))}
                    </Space>
                );
            },
        },
        {
            title: 'Última captura',
            key: 'ultima',
            render: ({ registro }: (typeof linhasBuscaTelegram)[number]) =>
                registro?.ultimaCapturaSucesso
                    ? dayjs(registro.ultimaCapturaSucesso).format('DD/MM/YYYY HH:mm')
                    : 'Nunca',
        },
        {
            title: 'Destino',
            key: 'destino',
            render: ({ registro }: (typeof linhasBuscaTelegram)[number]) =>
                registro?.destinoCentral || 'Definir armazenamento',
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: ({ fonte }: (typeof linhasBuscaTelegram)[number]) => (
                <Space>
                    <Button type="primary" onClick={() => abrirModalColeta(fonte)}>
                        Configurar
                    </Button>
                    <Button onClick={() => dispararColeta(fonte)}>Baixar agora</Button>
                </Space>
            ),
        },
    ];

    return (
        <Container>
            <Cabecalho>
                <div>
                    <Title level={4}>Fontes para vazamentos de senhas</Title>
                    <Text type="secondary">Cadastre e priorize todas as origens de coleta.</Text>
                </div>
                <Space>
                    <Select
                        value={filtroTipo}
                        style={{ width: 200 }}
                        onChange={(valor) => setFiltroTipo(valor as TipoFonteVazamento | 'TODOS')}
                        options={[{ label: 'Todas as fontes', value: 'TODOS' }, ...tiposFonte.map((t) => ({ label: t.rotulo, value: t.valor }))]}
                    />
                    <Button icon={<ReloadOutlined />} onClick={() => recarregarFontes()} />
                    <Button type="primary" icon={<PlusOutlined />} onClick={abrirModalCriacao}>
                        Nova fonte
                    </Button>
                </Space>
            </Cabecalho>
            <Row gutter={16} style={{ flex: 1 }}>
                <Col span={16} style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                    <Painel bordered title="Cadastro de fontes" style={{ flex: 1 }}>
                        <Table
                            rowKey="id"
                            dataSource={dadosTabela}
                            columns={colunas}
                            loading={isLoading}
                            pagination={{ pageSize: 8 }}
                        />
                    </Painel>
                </Col>
                <Col span={8} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Destaque bordered>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Title level={5} style={{ margin: 0 }}>Cobertura por tipo</Title>
                            <Row gutter={12}>
                                {totaisPorTipo.map((tipo) => (
                                    <Col span={12} key={tipo.valor}>
                                        <Card size="small">
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                                <Text strong>{tipo.rotulo}</Text>
                                                <Tag color={tipo.cor}>{tipo.quantidade} fontes</Tag>
                                            </Space>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Space>
                    </Destaque>
                    <Destaque bordered>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Title level={5} style={{ margin: 0 }}>Critérios obrigatórios</Title>
                            {tiposFonte.map((tipo) => (
                                <Card key={tipo.valor} size="small" title={tipo.rotulo}>
                                    <Space wrap>
                                        {camposPorTipo[tipo.valor].map((campo) => (
                                            <Tag color={campo.obrigatorio ? 'red' : 'default'} key={`${tipo.valor}-${campo.chave}`}>
                                                {campo.rotulo}
                                            </Tag>
                                        ))}
                                    </Space>
                                </Card>
                            ))}
                        </Space>
                    </Destaque>
                </Col>
            </Row>
            <Card
                title="Busca ativa no Telegram"
                bordered
                extra={
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={() => recarregarBuscas()} />
                        <Button icon={<ReloadOutlined />} onClick={() => recarregarFontes()} />
                    </Space>
                }
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text type="secondary">
                        Dispare coletas nos grupos cadastrados, baixando apenas arquivos com extensões aprovadas a partir da
                        última captura concluída.
                    </Text>
                    <Table
                        rowKey={(linha) => `${linha.fonte.id}`}
                        dataSource={linhasBuscaTelegram}
                        columns={colunasTelegram}
                        loading={carregandoBusca || isLoading}
                        pagination={false}
                    />
                </Space>
            </Card>
            <Modal
                title={fonteEdicao ? 'Editar fonte' : 'Nova fonte'}
                open={modalAberto}
                onOk={salvarFonte}
                onCancel={fecharModal}
                okText="Salvar"
                cancelText="Cancelar"
                width={720}
                destroyOnClose
            >
                <Form layout="vertical" form={form} initialValues={{ tipo: 'TELEGRAM', parametros: {} }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe o nome da fonte' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: 'Selecione o tipo' }]}>
                                <Select options={tiposFonte.map((tipo) => ({ label: tipo.rotulo, value: tipo.valor }))} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="observacoes" label="Observações">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Title level={5}>Parâmetros</Title>
                    <Row gutter={12}>
                        {camposPorTipo[tipoSelecionado].map((campo) => (
                            <Col span={12} key={campo.chave}>
                                <Form.Item
                                    name={['parametros', campo.chave]}
                                    label={
                                        ajudaCampos[campo.chave] ? (
                                            <Space size={6}>
                                                <span>{campo.rotulo}</span>
                                                <Tooltip title={ajudaCampos[campo.chave]} trigger="click">
                                                    <Button type="link" size="small" icon={<InfoCircleOutlined />} />
                                                </Tooltip>
                                            </Space>
                                        ) : (
                                            campo.rotulo
                                        )
                                    }
                                    rules={campo.obrigatorio ? [{ required: true, message: 'Campo obrigatório' }] : []}
                                >
                                    {campo.tipo === 'numero' && <InputNumber style={{ width: '100%' }} min={0} />}
                                    {campo.tipo === 'tags' && <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']} />}
                                    {campo.tipo === 'opcao' && <Select options={campo.opcoes} />} 
                                    {!campo.tipo && !campo.opcoes && <Input />}
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                </Form>
            </Modal>
            <Modal
                title="Configurar busca ativa no Telegram"
                open={modalColetaAberto}
                onOk={salvarConfiguracaoColeta}
                onCancel={fecharModalColeta}
                okText="Salvar"
                cancelText="Cancelar"
                width={520}
                destroyOnClose
            >
                <Form layout="vertical" form={formColeta}>
                    <Form.Item
                        name="extensoes"
                        label="Extensões permitidas"
                        rules={[{ required: true, message: 'Defina as extensões' }]}
                    >
                        <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']} placeholder="Ex: zip, csv" />
                    </Form.Item>
                    <Form.Item
                        name="destinoCentral"
                        label="Destino centralizado"
                        rules={[{ required: true, message: 'Informe onde armazenar os arquivos' }]}
                    >
                        <Input placeholder="Ex: /tmp/armazenamento/telegram" />
                    </Form.Item>
                    <Form.Item name="ultimaCapturaSucesso" label="Última captura bem-sucedida">
                        <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
                    </Form.Item>
                    <Text type="secondary">
                        As credenciais sensíveis do Telegram devem estar preenchidas em Configurações para que a coleta seja
                        executada.
                    </Text>
                </Form>
            </Modal>
        </Container>
    );
};

export default VazamentoSenhasView;
