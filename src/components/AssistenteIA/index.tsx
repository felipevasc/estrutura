"use client";

import React, { useContext, useMemo, useState } from "react";
import { Button, Divider, Drawer, FloatButton, Input, Space, Tag, Typography, notification } from "antd";
import { MessageOutlined, SendOutlined, ThunderboltOutlined } from "@ant-design/icons";
import useApi from "@/api";
import StoreContext from "@/store";
import { AiCommandSuggestion, ChatMessage, ChatMessageWithCommands } from "@/types/AiChat";
import { StyledAssistant, StyledBubble, StyledChatBody, StyledCommandCard, StyledMessage } from "./styles";

const { Text } = Typography;

const extractCommands = (raw: string): { cleanText: string; commands: AiCommandSuggestion[] } => {
    const matches = raw.match(/\{[^}]*"COMANDO"[^}]*\}/g) || [];
    const parsedCommands: AiCommandSuggestion[] = [];

    matches.forEach((match) => {
        try {
            const normalized = match.replace(/"([A-Za-z0-9_]+)"\s*:/g, (full, key) => `"${key.toUpperCase()}":`);
            const parsed = JSON.parse(normalized);
            parsedCommands.push(parsed);
        } catch (_error) {
            parsedCommands.push({ COMANDO: "INVÁLIDO", bruto: match });
        }
    });

    const cleanText = matches.reduce((acc, current) => acc.replace(current, "").trim(), raw).replace(/\n{3,}/g, "\n\n");

    return { cleanText: cleanText || raw, commands: parsedCommands };
};

const AssistenteIA = () => {
    const { projeto } = useContext(StoreContext);
    const api = useApi();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessageWithCommands[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const projectId = useMemo(() => projeto?.get()?.id, [projeto]);

    const notifyError = (message: string, description?: string) => {
        notification.error({ message, description, placement: "bottomRight" });
    };

    const notifySuccess = (message: string, description?: string) => {
        notification.success({ message, description, placement: "bottomRight" });
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        if (!projectId) {
            notifyError('Selecione um projeto para conversar com a IA.');
            return;
        }

        const userMessage: ChatMessage = { role: 'user', content: input.trim() };
        const history = [...messages, userMessage].map((msg) => ({ role: msg.role, content: msg.content })) as ChatMessage[];

        setMessages((prev) => [...prev, { ...userMessage }]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await api.ia.chat(projectId, history);
            const { cleanText, commands } = extractCommands(response.content);
            setMessages((prev) => [...prev, { role: 'assistant', content: cleanText, commands }]);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : undefined;
            notifyError('Erro ao consultar IA', message);
        } finally {
            setIsLoading(false);
        }
    };

    const executarSugestao = async (command: AiCommandSuggestion) => {
        if (!projectId) {
            notifyError('Selecione um projeto para executar comandos.');
            return;
        }
        try {
            await api.ia.executarSugestao(projectId, command);
            notifySuccess('Comando adicionado à fila', JSON.stringify(command));
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : undefined;
            notifyError('Falha ao adicionar comando', message);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const renderMessage = (message: ChatMessageWithCommands, index: number) => (
        <StyledMessage key={`${message.role}-${index}`} $role={message.role}>
            <Tag color={message.role === 'user' ? 'blue' : 'purple'}>{message.role === 'user' ? 'Você' : 'IA'}</Tag>
            <StyledBubble $role={message.role}>{message.content}</StyledBubble>
            {message.commands && message.commands.length > 0 && (
                <div style={{ width: '100%' }}>
                    {message.commands.map((cmd, idx) => (
                        <StyledCommandCard key={`${index}-${idx}`}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Text strong>Comando sugerido</Text>
                                <pre>{JSON.stringify(cmd, null, 2)}</pre>
                                <Button
                                    icon={<ThunderboltOutlined />}
                                    type="primary"
                                    block
                                    onClick={() => executarSugestao(cmd)}
                                >
                                    Executar no ambiente
                                </Button>
                            </Space>
                        </StyledCommandCard>
                    ))}
                </div>
            )}
        </StyledMessage>
    );

    return (
        <StyledAssistant>
            <FloatButton
                icon={<MessageOutlined />}
                type="primary"
                tooltip="Assistente IA contextual"
                onClick={() => setIsOpen(true)}
            />

            <Drawer
                title="Assistente de Operações (IA)"
                placement="bottom"
                height="70vh"
                onClose={() => setIsOpen(false)}
                open={isOpen}
                destroyOnClose
            >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Text type="secondary">
                        Conversa otimizada para Red Team/CTF. A IA já conhece o contexto do projeto e pode sugerir comandos no formato JSON para execução automática.
                    </Text>
                    <StyledChatBody>
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                            {messages.length === 0 && (
                                <Text type="secondary">Envie sua primeira pergunta para iniciar.</Text>
                            )}
                            {messages.map((message, index) => renderMessage(message, index))}
                        </Space>
                    </StyledChatBody>
                    <Divider style={{ margin: '8px 0' }} />
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Input.TextArea
                            value={input}
                            placeholder="Pergunte à IA ou peça próximos passos..."
                            autoSize={{ minRows: 3, maxRows: 6 }}
                            onChange={(e) => setInput(e.target.value)}
                            onPressEnter={handleKeyPress}
                            disabled={isLoading}
                        />
                        <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} loading={isLoading} block>
                            Enviar
                        </Button>
                    </Space>
                </Space>
            </Drawer>
        </StyledAssistant>
    );
};

export default AssistenteIA;
