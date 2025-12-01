"use client";

import { StyledStatusBar, StatusItem, AreaTerminais } from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTerminal, faCircleNotch, faExclamationTriangle, faCog } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import StoreContext from "@/store";
import useApi from "@/api";
import { Command } from "@prisma/client";
import { Drawer, Tabs, Tag, Popconfirm, Button } from "antd";
import { DeleteOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { VscTerminal } from "react-icons/vsc";
import AnsiToHtml from 'ansi-to-html';

const StatusBar = () => {
    const conversorAnsi = new AnsiToHtml();
    const [comandos, definirComandos] = useState<Command[]>([]);
    const [gavetaAberta, definirGavetaAberta] = useState(false);
    const [expandidos, definirExpandidos] = useState<Record<number, boolean>>({});
    const { projeto, isConfiguracoesOpen } = useContext(StoreContext);
    const api = useApi();
    const temporizador = useRef<NodeJS.Timeout>(null);

    const idProjeto = projeto?.get()?.id;

    const carregarComandos = useCallback(async () => {
        if (!idProjeto) return;
        try {
            const dados = await api.queue.getCommands(idProjeto);
            definirComandos(dados);
            if (temporizador.current) clearTimeout(temporizador.current);
            temporizador.current = setTimeout(carregarComandos, 5000);
        } catch (error) {
            console.error("Falha ao buscar comandos", error);
        }
    }, [idProjeto, api.queue]);

    useEffect(() => {
        carregarComandos();
        return () => {
            if (temporizador.current) clearTimeout(temporizador.current);
        }
    }, [carregarComandos]);

    const comandosExecutando = comandos.filter(c => c.status === 'RUNNING');
    const comandosFalhos = comandos.filter(c => c.status === 'FAILED');
    const comandosPendentes = comandos.filter(c => c.status === 'PENDING');
    const comandosHistorico = comandos.filter(c => c.status === 'COMPLETED' || c.status === 'FAILED');

    const executando = comandosExecutando.length > 0;
    const falhas = comandosFalhos.length > 0;

    let textoStatus = "Pronto";
    let iconeStatus = faCheckCircle;
    let corStatus = "inherit";

    if (executando) {
        textoStatus = `Executando ${comandosExecutando[0].command}... (${comandosExecutando.length} em fila)`;
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

    const itensGaveta = [
        {
            key: '1',
            label: `Executando (${comandosExecutando.length})`,
            children: renderizarTerminais(comandosExecutando, false),
        },
        {
            key: '2',
            label: `Aguardando (${comandosPendentes.length})`,
            children: renderizarTerminais(comandosPendentes, true),
        },
        {
            key: '3',
            label: 'Histórico',
            children: renderizarTerminais(comandosHistorico, false),
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
