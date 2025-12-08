import { memo, useCallback, useContext, useEffect, useRef, useState, type RefObject } from 'react';
import Image from 'next/image';
import { Button, Input, Spin, message as antMessage } from 'antd';
import { SendOutlined, CaretRightOutlined } from '@ant-design/icons';
import { StyledDrawer, ChatButtonContainer, ChatContainer, MessagesArea, InputArea, MessageBubble, CommandBlock, CommandHeader, CommandContent, CommandActions } from './styles';
import WeaverAvatar from './WeaverAvatar';
import StoreContext from '@/store';
import useApi from '@/api';

interface Mensagem {
    role: 'user' | 'assistant' | 'system';
    content: string;
    comandos?: ComandoSugerido[];
}

interface MensagensProps {
    mensagens: Mensagem[];
    carregando: boolean;
    aoExecutar: (comando: ComandoSugerido) => void;
    referenciaFinal: RefObject<HTMLDivElement>;
}

type ComandoSugerido = { COMANDO: string } & Record<string, unknown>;

const imagemFallback = '/weaver/animacao1/p1.png';

const BlocoMensagens = memo(({ mensagens, carregando, aoExecutar, referenciaFinal }: MensagensProps) => (
    <MessagesArea>
        {mensagens.length === 0 && (
            <div style={{ color: '#666', textAlign: 'center', marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Image src={imagemFallback} width={120} height={120} alt="Weaver" />
                </div>
                <p>Como posso ajudar com o seu projeto?</p>
            </div>
        )}
        {mensagens.map((mensagem, indice) => (
            <div key={`${mensagem.role}-${indice}`} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {mensagem.content && (
                    <MessageBubble $isUser={mensagem.role === 'user'}>
                        {mensagem.content}
                    </MessageBubble>
                )}
                {mensagem.comandos && mensagem.comandos.map((comando, indiceComando) => (
                    <CommandBlock key={`${comando.COMANDO}-${indiceComando}`}>
                        <CommandHeader>
                            <span>SUGESTÃO DE COMANDO</span>
                        </CommandHeader>
                        <CommandContent>
                            $ {comando.COMANDO} {Object.entries(comando).filter(([chave]) => chave !== 'COMANDO').map(([, valor]) => String(valor ?? '')).join(' ')}
                        </CommandContent>
                        <CommandActions>
                            <Button
                                type="primary"
                                size="small"
                                icon={<CaretRightOutlined />}
                                onClick={() => aoExecutar(comando)}
                            >
                                Executar
                            </Button>
                        </CommandActions>
                    </CommandBlock>
                ))}
            </div>
        ))}
        {carregando && <Spin tip="Pensando..." style={{ alignSelf: 'center', marginTop: '10px' }} />}
        <div ref={referenciaFinal} />
    </MessagesArea>
));

BlocoMensagens.displayName = 'BlocoMensagens';

const ChatWidget = () => {
    const [aberto, definirAberto] = useState(false);
    const [mensagens, definirMensagens] = useState<Mensagem[]>([]);
    const [textoEntrada, definirTextoEntrada] = useState('');
    const [carregando, definirCarregando] = useState(false);
    const referenciaMensagens = useRef<HTMLDivElement>(null);
    const { projeto } = useContext(StoreContext);
    const api = useApi();

    const idProjeto = projeto?.get ? projeto.get()?.id : null;

    const rolarParaFim = useCallback(() => {
        referenciaMensagens.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (aberto) rolarParaFim();
    }, [mensagens, aberto, rolarParaFim]);

    const interpretarResposta = useCallback((conteudo: string): { texto: string, comandos: ComandoSugerido[] } => {
        if (!conteudo) return { texto: '', comandos: [] };

        const linhas = conteudo.split('\n');
        const comandos: ComandoSugerido[] = [];
        const linhasTexto: string[] = [];

        linhas.forEach(linha => {
            const linhaTratada = linha.trim();
            if (linhaTratada.startsWith('{') && linhaTratada.endsWith('}') && linhaTratada.includes('"COMANDO"')) {
                try {
                    const comando = JSON.parse(linhaTratada) as ComandoSugerido;
                    comandos.push(comando);
                } catch {
                    linhasTexto.push(linha);
                }
            } else {
                linhasTexto.push(linha);
            }
        });

        return { texto: linhasTexto.join('\n').trim(), comandos };
    }, []);

    const enviarMensagem = async () => {
        if (!textoEntrada.trim()) return;

        if (!idProjeto) {
            antMessage.warning('Selecione um projeto primeiro.');
            return;
        }

        const mensagemUsuario: Mensagem = { role: 'user', content: textoEntrada };
        const filaMensagens = [...mensagens, mensagemUsuario];
        definirMensagens(filaMensagens);
        definirTextoEntrada('');
        definirCarregando(true);

        try {
            const mensagensApi = filaMensagens.map(mensagem => ({ role: mensagem.role, content: mensagem.content }));
            const resposta = await api.chat.sendMessage(idProjeto, mensagensApi);
            const { texto, comandos } = interpretarResposta(resposta.message);
            const mensagemAssistente: Mensagem = { role: 'assistant', content: texto, comandos };
            definirMensagens(lista => [...lista, mensagemAssistente]);
        } catch (erro) {
            const mensagemErro = erro instanceof Error ? erro.message : 'Erro desconhecido';
            antMessage.error(`Erro ao enviar mensagem: ${mensagemErro}`);
        } finally {
            definirCarregando(false);
        }
    };

    const executarComando = useCallback(async (comando: ComandoSugerido) => {
        if (!idProjeto) return;
        try {
            antMessage.loading({ content: 'Enfileirando comando...', key: 'exec_cmd' });
            await api.chat.executeCommand(idProjeto, comando);
            antMessage.success({ content: 'Comando enfileirado com sucesso!', key: 'exec_cmd' });
        } catch (erro) {
            const mensagemErro = erro instanceof Error ? erro.message : 'Erro desconhecido';
            antMessage.error({ content: `Erro ao executar: ${mensagemErro}`, key: 'exec_cmd' });
        }
    }, [idProjeto, api.chat]);

    return (
        <>
            <ChatButtonContainer onClick={() => definirAberto(true)} title="Weaver">
                <WeaverAvatar size={50} />
            </ChatButtonContainer>

            <StyledDrawer
                title="Weaver"
                placement="right"
                width={500}
                onClose={() => definirAberto(false)}
                open={aberto}
                mask={false}
            >
                <ChatContainer>
                    <BlocoMensagens mensagens={mensagens} carregando={carregando} aoExecutar={executarComando} referenciaFinal={referenciaMensagens as RefObject<HTMLDivElement>} />
                    <InputArea>
                        <Input.TextArea
                            value={textoEntrada}
                            onChange={evento => definirTextoEntrada(evento.target.value)}
                            onKeyDown={evento => {
                                if (evento.key === 'Enter' && !evento.shiftKey) {
                                    evento.preventDefault();
                                    enviarMensagem();
                                }
                            }}
                            placeholder="Digite sua mensagem... (Enter para enviar)"
                            autoSize={{ minRows: 1, maxRows: 4 }}
                            style={{ backgroundColor: '#1e1e1e', color: 'white', border: '1px solid #333' }}
                        />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={enviarMensagem}
                            loading={carregando}
                        />
                    </InputArea>
                </ChatContainer>
            </StyledDrawer>
        </>
    );
};

export default ChatWidget;
