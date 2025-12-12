'use client';

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AutoComplete, Button, Form, Input, Space, Switch, Table, Tag, Typography, message, Popconfirm, Select } from "antd";
import { useWatch } from "antd/es/form/Form";
import dayjs from "dayjs";
import { SentinelaModulo } from "@prisma/client";
import { AtualizacaoSentinela, NovoSentinela, SentinelaRegistro } from "@/types/Sentinela";
import useApi from "@/api";
import StoreContext from "@/store";
import { AreaConteudo, CartaoFormulario, CartaoLista, ContainerSentinela } from "./styles";

type FormularioSentinela = NovoSentinela & { parametrosTexto?: string };

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

const camposFerramentas: Record<SentinelaModulo, Record<string, { chave: string; rotulo: string; tipo?: 'numero' | 'booleano' | 'textoLongo'; origem?: 'dominio' | 'ip' }[]>> = {
    RECON: {
        amass: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'timeoutMinutos', rotulo: 'Timeout em minutos', tipo: 'numero' },
        ],
        subfinder: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'todasFontes', rotulo: 'Todas as fontes', tipo: 'booleano' },
            { chave: 'modoSilencioso', rotulo: 'Modo silencioso', tipo: 'booleano' },
        ],
        dnsenum: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'threads', rotulo: 'Threads', tipo: 'numero' },
            { chave: 'wordlist', rotulo: 'Wordlist' },
        ],
        nslookup: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'servidorDns', rotulo: 'Servidor DNS' },
        ],
        nmap: [
            { chave: 'idIp', rotulo: 'ID do IP', tipo: 'numero', origem: 'ip' },
            { chave: 'faixaPortas', rotulo: 'Faixa de portas' },
        ],
        rustscan: [
            { chave: 'idIp', rotulo: 'ID do IP', tipo: 'numero', origem: 'ip' },
            { chave: 'faixaPortas', rotulo: 'Faixa de portas' },
        ],
        ffuf: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'rota', rotulo: 'Rota' },
            { chave: 'wordlist', rotulo: 'Wordlist' },
            { chave: 'statusDesejados', rotulo: 'Status desejados' },
        ],
        gobuster: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'wordlist', rotulo: 'Wordlist' },
        ],
        wgetRecursivo: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
        ],
        whatweb: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
        ],
        detectarServico: [
            { chave: 'idIp', rotulo: 'ID do IP', tipo: 'numero', origem: 'ip' },
            { chave: 'faixaPortas', rotulo: 'Faixa de portas' },
        ],
        identificarLinguagem: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'rota', rotulo: 'Rota' },
        ],
        identificarFramework: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'rota', rotulo: 'Rota' },
        ],
        enum4linux: [
            { chave: 'idIp', rotulo: 'ID do IP', tipo: 'numero', origem: 'ip' },
        ],
        whoisDominio: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
        ],
        recon_capturar: [
            { chave: 'idDominio', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'rota', rotulo: 'Rota' },
        ],
    },
    CTI: {
        phishing_dnstwist_check: [
            { chave: 'dominioId', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
        ],
        phishing_dnstwist_termo: [
            { chave: 'termo', rotulo: 'Termo' },
        ],
        phishing_crtsh_check: [
            { chave: 'dominioId', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
        ],
        phishing_crtsh_termo: [
            { chave: 'termo', rotulo: 'Termo' },
        ],
        phishing_verificar: [
            { chave: 'id', rotulo: 'ID da captura', tipo: 'numero' },
        ],
        phishing_capturar: [
            { chave: 'dominioId', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'ids', rotulo: 'IDs das capturas' },
        ],
        phishing_catcher_check: [
            { chave: 'dominioId', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
        ],
        phishing_analise_pagina: [
            { chave: 'dominioId', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'alvo', rotulo: 'URL alvo' },
            { chave: 'html', rotulo: 'HTML', tipo: 'textoLongo' },
        ],
        deface_capturar: [
            { chave: 'dominioId', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
            { chave: 'ids', rotulo: 'IDs das capturas' },
        ],
        deface_dork_check: [
            { chave: 'termos', rotulo: 'Termos' },
        ],
        deface_forum_zone_xsec_check: [
            { chave: 'dominioId', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
        ],
        deface_forum_hack_db_check: [
            { chave: 'dominioId', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
        ],
        takedown_check: [
            { chave: 'dominioId', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
        ],
        info_disclosure_check: [
            { chave: 'dominioId', rotulo: 'ID do domínio', tipo: 'numero', origem: 'dominio' },
        ],
        info_disclosure_paste: [
            { chave: 'url', rotulo: 'URL' },
        ],
        info_disclosure_codigo: [
            { chave: 'url', rotulo: 'URL' },
        ],
        busca_ativa_vazamento_telegram: [
            { chave: 'termo', rotulo: 'Termo' },
        ],
        busca_ativa_vazamento_telegram_teste: [
            { chave: 'termo', rotulo: 'Termo' },
        ],
        fontes_dados_vazamento: [
            { chave: 'termo', rotulo: 'Termo' },
        ],
        tratamento_vazamento: [
            { chave: 'termo', rotulo: 'Termo' },
        ],
        base_vazamentos: [
            { chave: 'termo', rotulo: 'Termo' },
        ],
        comunicacao_vazamentos: [
            { chave: 'termo', rotulo: 'Termo' },
        ],
        google_custom_search: [
            { chave: 'termo', rotulo: 'Termo' },
        ],
    },
};

const Sentinela = () => {
    const api = useApi();
    const { projeto } = useContext(StoreContext);
    const [form] = Form.useForm<FormularioSentinela>();
    const [moduloSelecionado, definirModuloSelecionado] = useState<SentinelaModulo>('RECON');
    const [registros, definirRegistros] = useState<SentinelaRegistro[]>([]);
    const [carregando, definirCarregando] = useState(false);
    const [criando, definirCriando] = useState(false);
    const [executando, definirExecutando] = useState<number | null>(null);

    const projetoId = projeto?.get()?.id;
    const ferramentaSelecionada = useWatch('ferramenta', form);
    const consultaDominios = api.dominios.getDominios(projetoId);
    const consultaIps = api.ips.getIps(projetoId);

    useEffect(() => {
        form.setFieldsValue({ modulo: 'RECON', habilitado: true, parametrosTexto: '{}' });
    }, [form]);

    const opcoesFerramentas = useMemo(() => {
        const base = moduloSelecionado === 'CTI' ? ferramentasCti : ferramentasRecon;
        return base.map(valor => ({ value: valor }));
    }, [moduloSelecionado]);

    const opcoesDominios = useMemo(() =>
        (consultaDominios.data ?? [])
            .map(item => ({ valor: item.id, rotulo: item.alias ? `${item.endereco} (${item.alias})` : item.endereco }))
            .filter((item): item is { valor: number; rotulo: string } => !!item.valor && !!item.rotulo),
    [consultaDominios.data]);

    const opcoesIps = useMemo(() =>
        (consultaIps.data ?? [])
            .map(item => ({ valor: item.id, rotulo: item.endereco }))
            .filter((item): item is { valor: number; rotulo: string } => !!item.valor && !!item.rotulo),
    [consultaIps.data]);

    const renderizarCampo = (campo: { chave: string; rotulo: string; tipo?: 'numero' | 'booleano' | 'textoLongo'; origem?: 'dominio' | 'ip' }) => {
        const opcoesOrigem = campo.origem === 'dominio' ? opcoesDominios : campo.origem === 'ip' ? opcoesIps : [];
        const carregandoOrigem = campo.origem === 'dominio' ? consultaDominios.isLoading : campo.origem === 'ip' ? consultaIps.isLoading : false;
        if (campo.origem) {
            return (
                <Form.Item key={campo.chave} name={["parametros", campo.chave]} label={campo.rotulo} rules={[{ required: true, message: 'Informe ' + campo.rotulo.toLowerCase() }]}>
                    <Select
                        options={opcoesOrigem.map(item => ({ value: item.valor, label: item.rotulo }))}
                        loading={carregandoOrigem}
                        showSearch
                        optionFilterProp="label"
                        allowClear
                    />
                </Form.Item>
            );
        }
        if (campo.tipo === 'booleano') {
            return (
                <Form.Item key={campo.chave} name={["parametros", campo.chave]} label={campo.rotulo} valuePropName="checked">
                    <Switch />
                </Form.Item>
            );
        }
        if (campo.tipo === 'textoLongo') {
            return (
                <Form.Item key={campo.chave} name={["parametros", campo.chave]} label={campo.rotulo} rules={[{ required: true, message: 'Informe ' + campo.rotulo.toLowerCase() }]}>
                    <Input.TextArea rows={4} />
                </Form.Item>
            );
        }
        return (
            <Form.Item key={campo.chave} name={["parametros", campo.chave]} label={campo.rotulo} rules={[{ required: true, message: 'Informe ' + campo.rotulo.toLowerCase() }]}>
                <Input type={campo.tipo === 'numero' ? 'number' : 'text'} />
            </Form.Item>
        );
    };

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

    useEffect(() => {
        form.setFieldsValue({ parametros: {}, parametrosTexto: '{}' });
    }, [form, ferramentaSelecionada, moduloSelecionado]);

    const tratarParametrosLivres = (entrada: unknown) => {
        if (typeof entrada === 'string') {
            try {
                return entrada ? JSON.parse(entrada) : {};
            } catch {
                message.error('Parâmetros precisam estar em JSON válido');
                throw new Error('json_invalido');
            }
        }
        if (entrada && typeof entrada === 'object') return entrada as Record<string, unknown>;
        return {};
    };

    const camposSelecionados = useMemo(() => camposFerramentas[moduloSelecionado]?.[ferramentaSelecionada as string] ?? [], [moduloSelecionado, ferramentaSelecionada]);

    const aoSubmeter = async (valores: FormularioSentinela) => {
        if (!projetoId) {
            message.error('Selecione um projeto para agendar comandos');
            return;
        }
        let parametros: Record<string, unknown>;
        try {
            parametros = camposSelecionados.length > 0 ? valores.parametros ?? {} : tratarParametrosLivres(valores.parametrosTexto);
        } catch {
            return;
        }
        definirCriando(true);
        try {
            const dadosEnvio = { ...valores, parametros } as Record<string, unknown>;
            delete dadosEnvio.parametrosTexto;
            await api.sentinela.criar(projetoId, dadosEnvio as NovoSentinela);
            message.success('Agendamento criado');
            form.resetFields(['nome', 'ferramenta', 'cron']);
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

    const executarAgora = async (registro: SentinelaRegistro) => {
        if (!projetoId) return;
        definirExecutando(registro.id);
        try {
            await api.sentinela.executar(projetoId, registro.id);
            await carregar();
            message.success('Execução iniciada');
        } catch (erro) {
            message.error(erro instanceof Error ? erro.message : 'Falha ao executar agendamento');
        } finally {
            definirExecutando(null);
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
                    <Button type="primary" onClick={() => executarAgora(registro)} loading={executando === registro.id}>
                        Executar agora
                    </Button>
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
                    <Form form={form} layout="vertical" onFinish={aoSubmeter} initialValues={{ habilitado: true, modulo: 'RECON', parametros: {}, parametrosTexto: '{}' }}>
                        <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe um nome' }]}>
                            <Input placeholder="Identificador do agendamento" />
                        </Form.Item>
                        <Form.Item name="modulo" label="Módulo" rules={[{ required: true, message: 'Selecione o módulo' }]}>
                            <Select
                                options={opcoesModulos.map(item => ({ value: item.valor, label: item.rotulo }))}
                                onChange={(valor: SentinelaModulo) => {
                                    definirModuloSelecionado(valor);
                                    form.setFieldsValue({ ferramenta: undefined, parametros: {}, parametrosTexto: '{}' });
                                }}
                            />
                        </Form.Item>
                        <Form.Item name="ferramenta" label="Ferramenta" rules={[{ required: true, message: 'Informe a ferramenta' }]}>
                            <AutoComplete options={opcoesFerramentas} placeholder="Nome do comando" allowClear filterOption />
                        </Form.Item>
                        {camposSelecionados.length > 0 ? (
                            camposSelecionados.map(renderizarCampo)
                        ) : (
                            <Form.Item name="parametrosTexto" label="Parâmetros (JSON)">
                                <Input.TextArea rows={4} placeholder='{"idDominio": 1}' />
                            </Form.Item>
                        )}
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
