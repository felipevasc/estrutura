export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatMessageWithCommands = ChatMessage & {
  commands?: AiCommandSuggestion[];
};

export type AiCommandSuggestion = Record<string, unknown> & {
  COMANDO?: string;
};
