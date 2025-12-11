'use client';

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AutoComplete, Button, Form, Input, Space, Switch, Table, Tag, Typography, message, Popconfirm, Select } from "antd";
import dayjs from "dayjs";
import { SentinelaModulo } from "@prisma/client";
import { AtualizacaoSentinela, NovoSentinela, SentinelaRegistro } from "@/types/Sentinela";
import useApi from "@/api";
import StoreContext from "@/store";
import { AreaConteudo, CartaoFormulario, CartaoLista, ContainerSentinela } from "./styles";

const ferramentasRecon = [
    'amass',
    'subfinder',
    'dnsenum',
    'nslookup',
    'nmap',
    'rustscan',
    'ffuf',
    'gobuster',
    'wgetRecursivo',
    'whatweb',
    'detectarServico',
    'identificarLinguagem',
    'identificarFramework',
    'enum4linux',
    'whoisDominio',
    'recon_capturar',
];

const ferramentasCti = [
    'phishing_dnstwist_check',
    'phishing_dnstwist_termo',
    'phishing_crtsh_check',
    'phishing_crtsh_termo',
    'phishing_verificar',
    'phishing_capturar',
    'phishing_catcher_check',
    'phishing_analise_pagina',
    'deface_capturar',
    'deface_dork_check',
    'deface_forum_zone_xsec_check',
    'deface_forum_hack_db_check',
    'takedown_check',
    'info_disclosure_check',
    'info_disclosure_paste',
    'info_disclosure_codigo',
    'busca_ativa_vazamento_telegram',
    'busca_ativa_vazamento_telegram_teste',
    'fontes_dados_vazamento',
    'tratamento_vazamento',
    'base_vazamentos',
    'comunicacao_vazamentos',
    'google_custom_search',
];

const opcoesModulos = [
    { valor: 'RECON' as SentinelaModulo, rotulo: 'Recon' },
    { valor: 'CTI' as SentinelaModulo, rotulo: 'CTI' },
];

const Sentinela = () => {
    const api = useApi();
    const { projeto } = useContext(StoreContext);
    const [form] = Form.useForm<NovoSentinela>();
    const [moduloSelecionado, definirModuloSelecionado] = useState<SentinelaModulo>('RECON');
    const [parametrosTexto, definirParametrosTexto] = useState('{}');
    const [registros, definirRegistros] = useState<SentinelaRegistro[]>([]);
    const [carregando, definirCarregando] = useState(false);
    const [criando, definirCriando] = useState(false);

    const projetoId = projeto?.get()?.id;

    useEffect(() => {
        form.setFieldsValue({ modulo: 'RECON', habilitado: true });
    }, [form]);

    const opcoesFerramentas = useMemo(() => {
        const base = moduloSelecionado === 'CTI' ? ferramentasCti : ferramentasRecon;
        return base.map(valor => ({ value: valor }));
    }, [moduloSelecionado]);

    const carregar = useCallback(async () => {
        if (!projetoId) {
            definirRegistros([]);
            return;
        }
        definirCarregando(true);
        try {
            const resposta = await api.sentinela.listar(projetoId);
            definirRegistros(resposta);
        } catch {
            message.error('Falha ao carregar os agendamentos');
        } finally {
            definirCarregando(false);
        }
    }, [api.sentinela, projetoId]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const interpretarParametros = () => {
        try {
            return parametrosTexto ? JSON.parse(parametrosTexto) : {};
        } catch {
            message.error('Parâmetros precisam estar em JSON válido');
            throw new Error('json_invalido');
        }
    };

    const aoSubmeter = async (valores: NovoSentinela) => {
        if (!projetoId) {
            message.error('Selecione um projeto para agendar comandos');
            return;
        }
        let parametros;
        try {
            parametros = interpretarParametros();
        } catch {
            return;
        }
        definirCriando(true);
        try {
            await api.sentinela.criar(projetoId, { ...valores, parametros });
            message.success('Agendamento criado');
            form.resetFields(['nome', 'ferramenta', 'cron']);
            definirParametrosTexto('{}');
            await carregar();
        } catch (erro) {
            message.error(erro instanceof Error ? erro.message : 'Erro ao criar agendamento');
        } finally {
            definirCriando(false);
        }
    };

    const alternarHabilitado = async (registro: SentinelaRegistro, habilitado: boolean) => {
        if (!projetoId) return;
        const dados: AtualizacaoSentinela = { habilitado };
        try {
            await api.sentinela.atualizar(projetoId, registro.id, dados);
            await carregar();
            message.success('Agendamento atualizado');
        } catch (erro) {
            message.error(erro instanceof Error ? erro.message : 'Falha ao atualizar agendamento');
        }
    };

    const remover = async (registro: SentinelaRegistro) => {
        if (!projetoId) return;
        try {
            await api.sentinela.remover(projetoId, registro.id);
            await carregar();
            message.success('Agendamento removido');
        } catch (erro) {
            message.error(erro instanceof Error ? erro.message : 'Falha ao remover agendamento');
        }
    };

    const formatarData = (valor: string | null) => valor ? dayjs(valor).format('DD/MM/YYYY HH:mm') : '-';

    const colunas = [
        { title: 'Nome', dataIndex: 'nome', key: 'nome' },
        {
            title: 'Módulo',
            dataIndex: 'modulo',
            key: 'modulo',
            render: (valor: SentinelaModulo) => <Tag color={valor === 'CTI' ? 'purple' : 'geekblue'}>{valor}</Tag>,
        },
        { title: 'Ferramenta', dataIndex: 'ferramenta', key: 'ferramenta' },
        { title: 'Cron', dataIndex: 'cron', key: 'cron' },
        {
            title: 'Próxima execução',
            dataIndex: 'proximaExecucao',
            key: 'proximaExecucao',
            render: (valor: string | null) => formatarData(valor),
        },
        {
            title: 'Última execução',
            dataIndex: 'ultimaExecucao',
            key: 'ultimaExecucao',
            render: (valor: string | null) => formatarData(valor),
        },
        {
            title: 'Status',
            key: 'habilitado',
            render: (_: unknown, registro: SentinelaRegistro) => (
                <Switch
                    checked={registro.habilitado}
                    onChange={(estado) => alternarHabilitado(registro, estado)}
                    checkedChildren="Ativo"
                    unCheckedChildren="Pausado"
                />
            ),
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_: unknown, registro: SentinelaRegistro) => (
                <Space>
                    <Popconfirm title="Remover agendamento?" okText="Sim" cancelText="Não" onConfirm={() => remover(registro)}>
                        <Button danger>Remover</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <ContainerSentinela>
            <Typography.Title level={3}>Sentinela</Typography.Title>
            <AreaConteudo>
                <CartaoFormulario>
                    <Typography.Title level={5}>Novo agendamento</Typography.Title>
                    <Form form={form} layout="vertical" onFinish={aoSubmeter} initialValues={{ habilitado: true, modulo: 'RECON' }}>
                        <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe um nome' }]}>
                            <Input placeholder="Identificador do agendamento" />
                        </Form.Item>
                        <Form.Item name="modulo" label="Módulo" rules={[{ required: true, message: 'Selecione o módulo' }]}>
                            <Select
                                options={opcoesModulos.map(item => ({ value: item.valor, label: item.rotulo }))}
                                onChange={(valor: SentinelaModulo) => definirModuloSelecionado(valor)}
                            />
                        </Form.Item>
                        <Form.Item name="ferramenta" label="Ferramenta" rules={[{ required: true, message: 'Informe a ferramenta' }]}>
                            <AutoComplete options={opcoesFerramentas} placeholder="Nome do comando" allowClear filterOption />
                        </Form.Item>
                        <Form.Item label="Parâmetros (JSON)">
                            <Input.TextArea
                                value={parametrosTexto}
                                onChange={(e) => definirParametrosTexto(e.target.value)}
                                rows={4}
                                placeholder='{"idDominio": 1}'
                            />
                        </Form.Item>
                        <Form.Item name="cron" label="Cron" rules={[{ required: true, message: 'Defina a expressão de cron' }]}>
                            <Input placeholder="minuto hora dia mes diaSemana" />
                        </Form.Item>
                        <Form.Item name="habilitado" label="Habilitado" valuePropName="checked">
                            <Switch checkedChildren="Sim" unCheckedChildren="Não" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block loading={criando}>
                            Salvar agendamento
                        </Button>
                    </Form>
                </CartaoFormulario>
                <CartaoLista>
                    <Typography.Title level={5}>Agendamentos</Typography.Title>
                    <Table
                        className="tabela-agendamentos"
                        columns={colunas}
                        dataSource={registros}
                        rowKey="id"
                        loading={carregando}
                        pagination={{ pageSize: 8 }}
                    />
                </CartaoLista>
            </AreaConteudo>
        </ContainerSentinela>
    );
};

export default Sentinela;
