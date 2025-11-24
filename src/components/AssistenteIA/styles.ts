import styled from "styled-components";

export const StyledAssistant = styled.div`
  position: fixed;
  bottom: 110px;
  right: 24px;
  z-index: 1200;
`;

export const StyledChatBody = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 12px;
  max-height: 55vh;
  overflow-y: auto;
`;

export const StyledMessage = styled.div<{ $role: 'user' | 'assistant' }>`
  display: flex;
  flex-direction: column;
  align-items: ${(p) => (p.$role === 'user' ? 'flex-end' : 'flex-start')};
  gap: 6px;
`;

export const StyledBubble = styled.div<{ $role: 'user' | 'assistant' }>`
  background: ${(p) => (p.$role === 'user' ? 'var(--accent-color)' : 'rgba(148, 163, 184, 0.12)')};
  color: ${(p) => (p.$role === 'user' ? '#0b1224' : 'var(--foreground)')};
  padding: 10px 12px;
  border-radius: 12px;
  max-width: 80%;
  width: fit-content;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
`;

export const StyledCommandCard = styled.div`
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  padding: 10px;
  margin-top: 6px;
  width: 100%;

  pre {
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0 0 8px 0;
    font-family: monospace;
    color: #cbd5e1;
  }
`;
