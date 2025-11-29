export const clienteTelegramBot = {
    descricao: 'Consome mensagens via bot HTTP e baixa arquivos filtrando extensões.',
    async executar(payload: Record<string, unknown>) {
        if (!payload.tokenBot) throw new Error('Bot do Telegram não configurado');
        return payload;
    },
};
