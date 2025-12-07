"use client";

import { StyledStatusBar, StatusItem, AreaTerminais } from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTerminal, faCircleNotch, faExclamationTriangle, faCog } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import StoreContext from "@/store";
import useApi from "@/api";
import { Command, CommandStatus } from "@prisma/client";
import { Drawer, Tabs, Tag, Popconfirm, Button, Spin } from "antd";
import { DeleteOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { VscTerminal } from "react-icons/vsc";
import AnsiToHtml from 'ansi-to-html';

type SecaoFila = 'executando' | 'pendentes' | 'historico';

type MapaSecao<T> = Record<SecaoFila, T>;

const statusSecao: MapaSecao<CommandStatus[]> = {
    executando: ['RUNNING'],
    pendentes: ['PENDING'],
    historico: ['COMPLETED', 'FAILED'],
};

const limitesSecao: MapaSecao<number> = {
    executando: 3,
    pendentes: 3,
    historico: 4,
};

const StatusBar = () => {
    const conversorAnsi = new AnsiToHtml();
    const [comandosSecao, definirComandosSecao] = useState<MapaSecao<Command[]>>({ executando: [], pendentes: [], historico: [] });
    const [totaisSecao, definirTotaisSecao] = useState<MapaSecao<number>>({ executando: 0, pendentes: 0, historico: 0 });
    const [carregandoSecao, definirCarregandoSecao] = useState<MapaSecao<boolean>>({ executando: false, pendentes: false, historico: false });
    const [gavetaAberta, definirGavetaAberta] = useState(false);
    const [expandidos, definirExpandidos] = useState<Record<number, boolean>>({});
    const { projeto, isConfiguracoesOpen } = useContext(StoreContext);
    const api = useApi();
    const temporizador = useRef<NodeJS.Timeout>(null);
    const comandosRef = useRef(comandosSecao);

    const idProjeto = projeto?.get()?.id;

    useEffect(() => { comandosRef.current = comandosSecao; }, [comandosSecao]);

    const limparTemporizador = () => {
        if (temporizador.current) clearTimeout(temporizador.current);
    };

    const obterLimiteAtual = (secao: SecaoFila, anexar: boolean) => {
        const atual = comandosRef.current[secao].length;
        if (anexar) return limitesSecao[secao];
        return Math.max(limitesSecao[secao], atual || limitesSecao[secao]);
    };

    const carregarSecao = useCallback(async (secao: SecaoFila, anexar = false) => {
        if (!idProjeto) return;
        definirCarregandoSecao(valor => ({ ...valor, [secao]: true }));
        try {
            const inicio = anexar ? comandosRef.current[secao].length : 0;
            const limite = obterLimiteAtual(secao, anexar);
            const resposta = await api.queue.getCommands({
                projectId: idProjeto,
                status: statusSecao[secao],
                limite,
                inicio,
            });
            const registros = resposta.registros as Command[];
            definirComandosSecao(valor => ({
                ...valor,
                [secao]: anexar ? [...valor[secao], ...registros] : registros,
            }));
            definirTotaisSecao(valor => ({ ...valor, [secao]: resposta.total }));
            definirExpandidos(valor => {
                const atualizados = { ...valor };
                registros.forEach(registro => {
                    if (atualizados[registro.id] === undefined) atualizados[registro.id] = true;
                });
                return atualizados;
            });
        } catch (error) {
            console.error("Falha ao buscar comandos", error);
        } finally {
            definirCarregandoSecao(valor => ({ ...valor, [secao]: false }));
        }
    }, [api.queue, idProjeto]);

    const carregarComandos = useCallback(() => {
        if (!gavetaAberta) return;
        carregarSecao('executando');
        carregarSecao('pendentes');
        carregarSecao('historico');
        limparTemporizador();
        temporizador.current = setTimeout(carregarComandos, 5000);
    }, [carregarSecao, gavetaAberta]);

    useEffect(() => {
        definirComandosSecao({ executando: [], pendentes: [], historico: [] });
        definirTotaisSecao({ executando: 0, pendentes: 0, historico: 0 });
        definirExpandidos({});
        limparTemporizador();
        if (!gavetaAberta) return;
        carregarComandos();
        return () => limparTemporizador();
    }, [carregarComandos, gavetaAberta, idProjeto]);

    const comandosExecutando = comandosSecao.executando;
    const comandosHistorico = comandosSecao.historico;
    const comandosFalhos = comandosHistorico.filter(c => c.status === 'FAILED');

    const executando = totaisSecao.executando > 0;
    const falhas = comandosFalhos.length > 0;

    let textoStatus = "Pronto";
    let iconeStatus = faCheckCircle;
    let corStatus = "inherit";

    if (executando) {
        const descricao = comandosExecutando[0]?.command || 'comando';
        textoStatus = `Executando ${descricao}... (${totaisSecao.executando} em fila)`;
        iconeStatus = faCircleNotch;
    } else if (falhas) {
        textoStatus = "Alguns comandos falharam";
        iconeStatus = faExclamationTriangle;
        corStatus = "#ffccc7";
    }

    const cancelarComando = async (id: number) => {
        try {
            await api.queue.cancelCommand(id);
            carregarComandos();
        } catch (error) {
            console.error("Falha ao cancelar comando", error);
        }
    };

    const obterEtiquetaStatus = (status: string) => {
        switch (status) {
            case 'RUNNING': return <Tag icon={<LoadingOutlined spin />} color="processing">Executando</Tag>;
            case 'PENDING': return <Tag color="warning">Aguardando</Tag>;
            case 'COMPLETED': return <Tag icon={<CheckCircleOutlined />} color="success">Concluído</Tag>;
            case 'FAILED': return <Tag icon={<CloseCircleOutlined />} color="error">Falhou</Tag>;
            default: return <Tag>Desconhecido</Tag>;
        }
    };

    const interpretarParametros = (conteudo: string) => {
        if (!conteudo) return null;
        try {
            return JSON.parse(conteudo);
        } catch {
            return null;
        }
    };

    const formatarParametros = (conteudo: string) => {
        const parametros = interpretarParametros(conteudo);
        if (!parametros) return conteudo;
        if (Array.isArray(parametros)) return parametros.join(' ');
        if (typeof parametros === 'object') return Object.entries(parametros).map(([chave, valor]) => `${chave}=${typeof valor === 'object' ? JSON.stringify(valor) : valor}`).join(' ');
        return `${parametros}`;
    };

    const montarLinhaComando = (comando: Command) => {
        if (comando.executedCommand) return comando.executedCommand;
        const parametros = formatarParametros(comando.args);
        if (parametros && parametros.trim().length > 0) return `${comando.command} ${parametros}`.trim();
        return comando.command;
    };

    const obterSaida = (comando: Command) => {
        const conteudo = comando.rawOutput || comando.output;
        if (conteudo) return conteudo;
        if (comando.status === 'RUNNING') return 'Comando em execução...';
        if (comando.status === 'PENDING') return 'Aguardando execução...';
        return 'Nenhum resultado disponível.';
    };

    const converterSaida = (conteudo: string) => conversorAnsi.toHtml(conteudo || '');

    const renderizarTerminais = (dados: Command[], permitirCancelar: boolean) => {
        if (!dados.length) return <div className="mensagem-vazia">Nenhum comando nessa categoria.</div>;
        return (
            <div className="lista-terminais">
            {dados.map(item => {
                const comandoFormatado = montarLinhaComando(item);
                const aberto = expandidos[item.id] ?? true;
                const alternarTerminal = () => definirExpandidos(valorAnterior => ({ ...valorAnterior, [item.id]: !aberto }));
                return (
                    <div key={item.id} className="terminal-cartao">
                        <div className="terminal-barra">
                            <div className="terminal-titulo" onClick={alternarTerminal}>
                                <div className="terminal-dots">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <VscTerminal />
                                <span>{comandoFormatado}</span>
                            </div>
                            <div className="terminal-acoes">
                                {obterEtiquetaStatus(item.status)}
                                <Button icon={aberto ? <UpOutlined /> : <DownOutlined />} onClick={alternarTerminal} shape="circle" />
                                {permitirCancelar && (
                                    <Popconfirm
                                        title="Cancelar comando?"
                                        onConfirm={() => cancelarComando(item.id)}
                                        okText="Sim"
                                        cancelText="Não"
                                    >
                                        <Button icon={<DeleteOutlined />} type="primary" danger shape="circle" />
                                    </Popconfirm>
                                )}
                            </div>
                        </div>
                        {aberto && (
                            <div className="terminal-corpo">
                                <div className="terminal-cabecalho">
                                    <span className="terminal-sessao">root@kali</span>
                                    <span className="terminal-local">~/estrutura</span>
                                </div>
                                <div className="terminal-linha">
                                    <span className="terminal-prompt">#</span>
                                    <span className="terminal-comando">{comandoFormatado}</span>
                                </div>
                                <div className="terminal-resultado">
                                    <pre dangerouslySetInnerHTML={{ __html: converterSaida(obterSaida(item)) }} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            </div>
        );
    };

    const montarConteudoSecao = (secao: SecaoFila, permitirCancelar: boolean) => {
        const dados = comandosSecao[secao];
        const carregando = carregandoSecao[secao];
        const possuiMais = dados.length < totaisSecao[secao];

        return (
            <div className="historico-conteudo">
                {carregando && !dados.length ? <Spin /> : renderizarTerminais(dados, permitirCancelar)}
                {possuiMais && (
                    <div className="historico-acoes">
                        <Button type="primary" ghost onClick={() => carregarSecao(secao, true)} loading={carregando}>
                            Carregar mais
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const itensGaveta = [
        {
            key: '1',
            label: `Executando (${totaisSecao.executando})`,
            children: montarConteudoSecao('executando', false),
        },
        {
            key: '2',
            label: `Aguardando (${totaisSecao.pendentes})`,
            children: montarConteudoSecao('pendentes', true),
        },
        {
            key: '3',
            label: 'Histórico',
            children: montarConteudoSecao('historico', false),
        }
    ];

    return (
        <>
            <StyledStatusBar>
                <StatusItem style={{ color: corStatus }}>
                    <FontAwesomeIcon icon={iconeStatus} spin={executando} /> Threat Weaver
                </StatusItem>

                <div style={{ flex: 1 }}></div>

                <StatusItem style={{ cursor: 'pointer' }} onClick={() => isConfiguracoesOpen?.set(true)}>
                    <FontAwesomeIcon icon={faCog} /> Configurações
                </StatusItem>

                <StatusItem style={{ cursor: 'pointer' }} onClick={() => definirGavetaAberta(true)}>
                    <FontAwesomeIcon icon={faTerminal} /> {textoStatus}
                </StatusItem>
            </StyledStatusBar>

            <Drawer
                title="Console de Execução"
                placement="bottom"
                height={400}
                onClose={() => definirGavetaAberta(false)}
                open={gavetaAberta}
            >
                <AreaTerminais>
                    <Tabs defaultActiveKey="1" items={itensGaveta} />
                </AreaTerminais>
            </Drawer>
        </>
    );
};

export default StatusBar;
