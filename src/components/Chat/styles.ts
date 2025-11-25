import styled from 'styled-components';
import { Drawer as AntDrawer } from 'antd';

export const ChatButtonContainer = styled.div`
    /* Used to position the float button if not using Antd FloatButton default */
`;

// @ts-ignore - Fixing TS4023
export const StyledDrawer = styled(AntDrawer)`
    .ant-drawer-content {
        background: transparent;
    }
    .ant-drawer-wrapper-body {
        background: ${({ theme }) => theme.glass.heavy};
        backdrop-filter: blur(20px);
    }
    .ant-drawer-header {
        background: ${({ theme }) => theme.glass.card};
        border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
        color: ${({ theme }) => theme.colors.text};
    }
    .ant-drawer-title {
        color: ${({ theme }) => theme.colors.text};
        font-weight: 600;
    }
    .ant-drawer-close {
        color: ${({ theme }) => theme.colors.text};
    }
    .ant-drawer-body {
        padding: 0;
        display: flex;
        flex-direction: column;
        background: transparent;
        color: ${({ theme }) => theme.colors.text};
    }
`;

export const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

export const MessagesArea = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colors.borderColor};
        border-radius: 3px;
    }
`;

export const InputArea = styled.div`
    padding: 15px;
    background: ${({ theme }) => theme.glass.card};
    border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
    display: flex;
    gap: 10px;
    align-items: flex-end;
`;

export const MessageBubble = styled.div<{ $isUser: boolean }>`
    background: ${props => props.$isUser ? props.theme.gradients.primary : props.theme.glass.card};
    color: #ffffff;
    padding: 12px 18px;
    border-radius: 12px;
    border-bottom-left-radius: ${props => props.$isUser ? '12px' : '0'};
    border-bottom-right-radius: ${props => props.$isUser ? '0' : '12px'};
    max-width: 90%;
    align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
    white-space: pre-wrap;
    word-break: break-word;
    box-shadow: ${({ theme }) => theme.shadows.soft};
    border: 1px solid ${({ theme, $isUser }) => $isUser ? 'transparent' : theme.colors.borderColor};
`;

export const CommandBlock = styled.div`
    background: #000000;
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: 6px;
    margin-top: 8px;
    overflow: hidden;
    max-width: 90%;
    align-self: flex-start;
    box-shadow: ${({ theme }) => theme.shadows.inner};
`;

export const CommandHeader = styled.div`
    background: ${({ theme }) => theme.colors.panelBackground};
    padding: 5px 10px;
    font-size: 11px;
    color: ${({ theme }) => theme.colors.textSecondary};
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

export const CommandContent = styled.div`
    padding: 10px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.success};
    background: rgba(0,0,0,0.5);
`;

export const CommandActions = styled.div`
    padding: 5px 10px;
    background: ${({ theme }) => theme.colors.panelBackground};
    border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
    display: flex;
    justify-content: flex-end;
`;
