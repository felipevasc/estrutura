import { useState, useRef, useEffect, useContext } from 'react';
import { Button, Input, Spin, FloatButton, message as antMessage } from 'antd';
import { SendOutlined, CaretRightOutlined } from '@ant-design/icons';
import { StyledDrawer, ChatButtonContainer, ChatContainer, MessagesArea, InputArea, MessageBubble, CommandBlock, CommandHeader, CommandContent, CommandActions, PainelAgente, DadosAgente, TituloAgente, SubtituloAgente, AvatarContainer, AvatarIlustracao } from './styles';
import StoreContext from '@/store';
import useApi from '@/api';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    commands?: any[];
}

const sequencias = [
    { pasta: 'animacao1', quadros: 7 },
    { pasta: 'animacao2', quadros: 9 },
    { pasta: 'animacao3', quadros: 5 },
    { pasta: 'animacao4', quadros: 10 },
    { pasta: 'animacao5', quadros: 8 },
];

const escolherAnimacao = (atual: number) => {
    let proxima = atual;
    while (proxima === atual) {
        proxima = Math.floor(Math.random() * sequencias.length);
    }
    return proxima;
};

const gerarVariacaoSuave = () => ({
    angulo: (Math.random() - 0.5) * 1.6,
    escala: 0.992 + Math.random() * 0.012,
    deslocamento: (Math.random() - 0.5) * 1.6,
    opacidade: 0.94 + Math.random() * 0.04,
    brilho: 0.22 + Math.random() * 0.16,
});

const AgenteWeaver = ({ tamanho }: { tamanho: number }) => {
    const [animacao, setAnimacao] = useState(0);
    const [quadro, setQuadro] = useState(0);
    const [animando, setAnimando] = useState(false);
    const [variacao, setVariacao] = useState(() => gerarVariacaoSuave());
    const agendamentoRef = useRef<NodeJS.Timeout | null>(null);
    const estadoAnimandoRef = useRef(false);

    useEffect(() => {
        const variar = setInterval(() => {
            if (!animando) setVariacao(gerarVariacaoSuave());
        }, 1800);
        return () => clearInterval(variar);
    }, [animando]);

    useEffect(() => {
        estadoAnimandoRef.current = animando;
    }, [animando]);

    useEffect(() => {
        const iniciar = () => {
            if (estadoAnimandoRef.current) return;

            setAnimacao(atual => {
                const proxima = escolherAnimacao(atual);
                setQuadro(0);
                setAnimando(true);
                setVariacao({ angulo: 0, escala: 1, deslocamento: 0, opacidade: 1, brilho: 0.26 });
                return proxima;
            });
        };

        const agendarCiclo = () => {
            const pausa = 4600 + Math.random() * 1800;
            agendamentoRef.current = setTimeout(() => {
                if (Math.random() > 0.45) iniciar();
                agendarCiclo();
            }, pausa);
        };

        const agendamentoInicial = setTimeout(agendarCiclo, 1200);

        return () => {
            clearTimeout(agendamentoInicial);
            if (agendamentoRef.current) clearTimeout(agendamentoRef.current);
        };
    }, []);

    useEffect(() => {
        if (!animando) return;

        const sequencia = sequencias[animacao];
        const intervaloQuadros = setInterval(() => {
            setQuadro(anterior => {
                const proximo = anterior + 1;
                if (proximo >= sequencia.quadros) {
                    setAnimando(false);
                    setAnimacao(0);
                    setVariacao(gerarVariacaoSuave());
                    return 0;
                }
                return proximo;
            });
        }, 160);

        return () => clearInterval(intervaloQuadros);
    }, [animando, animacao]);

    const pasta = animando ? sequencias[animacao].pasta : 'animacao1';
    const indiceQuadro = animando ? quadro : 0;
    const caminho = `/weaver/${pasta}/p${indiceQuadro + 1}.png`;

    return (
        <AvatarContainer $tamanho={tamanho}>
            <AvatarIlustracao
                src={caminho}
                alt="Weaver"
                $angulo={variacao.angulo}
                $escala={variacao.escala}
                $deslocamento={variacao.deslocamento}
                $opacidade={variacao.opacidade}
                $brilho={variacao.brilho}
            />
        </AvatarContainer>
    );
};

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { projeto } = useContext(StoreContext);
    const api = useApi();

    const projectId = projeto?.get ? projeto.get()?.id : null;

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

    return (
        <>
            <ChatButtonContainer>
                <FloatButton
                    icon={<AgenteWeaver tamanho={52} />}
                    type="primary"
                    onClick={() => setIsOpen(true)}
                    tooltip="Weaver"
                    style={{ left: 24, bottom: 24, width: 92, height: 92, borderRadius: 20, boxShadow: '0 14px 40px rgba(78, 192, 255, 0.35)' }}
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
                    <PainelAgente>
                        <AgenteWeaver tamanho={86} />
                        <DadosAgente>
                            <TituloAgente>Weaver</TituloAgente>
                            <SubtituloAgente>Pronta para sugerir ações em tempo real</SubtituloAgente>
                        </DadosAgente>
                    </PainelAgente>
                    <MessagesArea>
                        {messages.length === 0 && (
                            <div style={{ color: '#666', textAlign: 'center', marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <AgenteWeaver tamanho={110} />
                                <p>Olá! Sou a Weaver. Como posso ajudar com os achados do projeto?</p>
                            </div>
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
