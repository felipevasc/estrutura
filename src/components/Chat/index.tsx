import { useState, useRef, useEffect, useContext } from 'react';
import { Button, Input, Spin, FloatButton, message as antMessage } from 'antd';
import { SendOutlined, CaretRightOutlined } from '@ant-design/icons';
import { StyledDrawer, ChatButtonContainer, ChatContainer, MessagesArea, InputArea, MessageBubble, CommandBlock, CommandHeader, CommandContent, CommandActions, TopoWeaver, AvatarWeaver, BrilhoWeaver, ImagemWeaver, SaudacaoWeaver, TituloWeaver, LegendaWeaver, AreaVazia, MiniaturaWeaver } from './styles';
import StoreContext from '@/store';
import useApi from '@/api';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    commands?: any[];
}

const sequencias = [
    Array.from({ length: 7 }, (_, indice) => `/weaver/animacao1/p${indice + 1}.png`),
    Array.from({ length: 9 }, (_, indice) => `/weaver/animacao2/p${indice + 1}.png`),
    Array.from({ length: 5 }, (_, indice) => `/weaver/animacao3/p${indice + 1}.png`),
    Array.from({ length: 10 }, (_, indice) => `/weaver/animacao4/p${indice + 1}.png`),
    Array.from({ length: 8 }, (_, indice) => `/weaver/animacao5/p${indice + 1}.png`),
];

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [indiceAnimacao, setIndiceAnimacao] = useState(0);
    const [indiceQuadro, setIndiceQuadro] = useState(0);
    const [opacidadeQuadro, setOpacidadeQuadro] = useState(1);
    const [transformacaoQuadro, setTransformacaoQuadro] = useState('scale(1)');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { projeto } = useContext(StoreContext);
    const api = useApi();

    const projectId = projeto?.get ? projeto.get()?.id : null;

    const imagemAtual = sequencias[indiceAnimacao][indiceQuadro];

    const gerarTransformacao = () => {
        const deslocamentoX = (Math.random() * 4 - 2).toFixed(2);
        const deslocamentoY = (Math.random() * 6 - 3).toFixed(2);
        const escala = (1 + Math.random() * 0.06).toFixed(2);
        const rotacao = (Math.random() * 4 - 2).toFixed(2);
        return `translate(${deslocamentoX}px, ${deslocamentoY}px) scale(${escala}) rotate(${rotacao}deg)`;
    };

    const escolherAnimacao = (indiceAtual: number) => {
        let novoIndice = indiceAtual;
        while (novoIndice === indiceAtual) {
            novoIndice = Math.floor(Math.random() * sequencias.length);
        }
        return novoIndice;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const parseResponse = (content: string): { text: string, commands: any[] } => {
        if (!content) return { text: '', commands: [] };

        const lines = content.split('\n');
        const commands: any[] = [];
        const textLines: string[] = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}') && trimmed.includes('"COMANDO"')) {
                try {
                    const cmd = JSON.parse(trimmed);
                    commands.push(cmd);
                } catch {
                    textLines.push(line);
                }
            } else {
                textLines.push(line);
            }
        });

        return { text: textLines.join('\n').trim(), commands };
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        if (!projectId) {
            antMessage.warning('Selecione um projeto primeiro.');
            return;
        }

        const userMsg: Message = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setLoading(true);

        try {
            const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

            const data = await api.chat.sendMessage(projectId, apiMessages);

            const { text, commands } = parseResponse(data.message);
            const aiMsg: Message = { role: 'assistant', content: text, commands };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            console.error(error);
            antMessage.error(`Erro ao enviar mensagem: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async (command: any) => {
        if (!projectId) return;
        try {
            antMessage.loading({ content: 'Enfileirando comando...', key: 'exec_cmd' });
            await api.chat.executeCommand(projectId, command);
            antMessage.success({ content: 'Comando enfileirado com sucesso!', key: 'exec_cmd' });
        } catch (error: any) {
            antMessage.error({ content: `Erro ao executar: ${error.message}`, key: 'exec_cmd' });
        }
    };

    useEffect(() => {
        const intervalo = setInterval(() => {
            setIndiceQuadro(indiceAnterior => {
                const proximo = indiceAnterior + 1;
                const limite = sequencias[indiceAnimacao].length;
                setTransformacaoQuadro(gerarTransformacao());
                if (proximo >= limite) {
                    setIndiceAnimacao(escolherAnimacao(indiceAnimacao));
                    return 0;
                }
                return proximo;
            });
        }, 180);

        return () => clearInterval(intervalo);
    }, [indiceAnimacao]);

    useEffect(() => {
        setOpacidadeQuadro(0.45);
        const temporizador = setTimeout(() => setOpacidadeQuadro(1), 80);
        return () => clearTimeout(temporizador);
    }, [imagemAtual]);

    return (
        <>
            <ChatButtonContainer>
                <FloatButton
                    icon={<MiniaturaWeaver src="/weaver/animacao1/p1.png" alt="Weaver" />}
                    type="primary"
                    onClick={() => setIsOpen(true)}
                    tooltip="Weaver"
                    style={{ left: 24, bottom: 24 }}
                />
            </ChatButtonContainer>

            <StyledDrawer
                title="Weaver"
                placement="left"
                width={500}
                onClose={() => setIsOpen(false)}
                open={isOpen}
                mask={false}
            >
                <ChatContainer>
                    <TopoWeaver>
                        <AvatarWeaver>
                            <BrilhoWeaver>
                                <ImagemWeaver src={imagemAtual} alt="Weaver" $opacidade={opacidadeQuadro} $transformacao={transformacaoQuadro} />
                            </BrilhoWeaver>
                        </AvatarWeaver>
                        <SaudacaoWeaver>
                            <TituloWeaver>Weaver</TituloWeaver>
                            <LegendaWeaver>Sempre pronta para explorar achados e executar comandos.</LegendaWeaver>
                        </SaudacaoWeaver>
                    </TopoWeaver>
                    <MessagesArea>
                        {messages.length === 0 && (
                            <AreaVazia>
                                <AvatarWeaver>
                                    <BrilhoWeaver>
                                        <ImagemWeaver src={imagemAtual} alt="Weaver" $opacidade={opacidadeQuadro} $transformacao={transformacaoQuadro} />
                                    </BrilhoWeaver>
                                </AvatarWeaver>
                                <p>Olá! Sou a Weaver. Como posso ajudar com os achados do projeto?</p>
                            </AreaVazia>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                {msg.content && (
                                    <MessageBubble $isUser={msg.role === 'user'}>
                                        {msg.content}
                                    </MessageBubble>
                                )}
                                {msg.commands && msg.commands.map((cmd, cIdx) => (
                                    <CommandBlock key={cIdx}>
                                        <CommandHeader>
                                            <span>SUGESTÃO DE COMANDO</span>
                                        </CommandHeader>
                                        <CommandContent>
                                            $ {cmd.COMANDO} {Object.values(cmd).filter(v => v !== cmd.COMANDO).join(' ')}
                                        </CommandContent>
                                        <CommandActions>
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<CaretRightOutlined />}
                                                onClick={() => handleExecute(cmd)}
                                            >
                                                Executar
                                            </Button>
                                        </CommandActions>
                                    </CommandBlock>
                                ))}
                            </div>
                        ))}
                        {loading && <Spin tip="Pensando..." style={{ alignSelf: 'center', marginTop: '10px' }} />}
                        <div ref={messagesEndRef} />
                    </MessagesArea>
                    <InputArea>
                        <Input.TextArea
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Digite sua mensagem... (Enter para enviar)"
                            autoSize={{ minRows: 1, maxRows: 4 }}
                            style={{ backgroundColor: '#1e1e1e', color: 'white', border: '1px solid #333' }}
                        />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSend}
                            loading={loading}
                        />
                    </InputArea>
                </ChatContainer>
            </StyledDrawer>
        </>
    );
};

export default ChatWidget;
