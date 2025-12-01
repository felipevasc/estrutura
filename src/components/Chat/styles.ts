import styled, { keyframes } from 'styled-components';
import { Drawer as AntDrawer } from 'antd';

export const ChatButtonContainer = styled.div`
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
    background: ${props => props.theme.glass.card};
    color: #333;
    padding: 12px 18px;
    border-radius: 12px;
    border-bottom-left-radius: ${props => props.$isUser ? '12px' : '0'};
    border-top-right-radius: ${props => props.$isUser ? '0' : '12px'};
    max-width: 90%;
    align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
    white-space: pre-wrap;
    word-break: break-word;
    box-shadow: ${({ theme }) => theme.shadows.soft};
    border: 1px solid ${({ theme, $isUser }) => theme.colors.borderColor};
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

const pulsar = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(124, 101, 252, 0.35); }
    50% { box-shadow: 0 0 0 18px rgba(124, 101, 252, 0); }
    100% { box-shadow: 0 0 0 0 rgba(124, 101, 252, 0); }
`;

export const TopoWeaver = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: ${({ theme }) => theme.glass.card};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

export const AvatarWeaver = styled.div`
    width: 88px;
    height: 88px;
    display: grid;
    place-items: center;
    border-radius: 18px;
    background: radial-gradient(circle at 30% 30%, rgba(132, 97, 255, 0.3), transparent), ${({ theme }) => theme.glass.heavy};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    animation: ${pulsar} 6s ease-in-out infinite;
    overflow: hidden;
`;

export const BrilhoWeaver = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 14px;
    background: linear-gradient(140deg, rgba(147, 110, 255, 0.45), rgba(69, 196, 255, 0.32));
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
`;

export const ImagemWeaver = styled.img<{ $opacidade: number; $transformacao: string }>`
    width: 78px;
    height: 78px;
    object-fit: contain;
    transition: opacity 0.35s ease, transform 0.35s ease;
    opacity: ${({ $opacidade }) => $opacidade};
    transform: ${({ $transformacao }) => $transformacao};
    filter: drop-shadow(0 8px 18px rgba(41, 28, 84, 0.35));
`;

export const SaudacaoWeaver = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const TituloWeaver = styled.span`
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    font-size: 18px;
`;

export const LegendaWeaver = styled.span`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 13px;
`;

export const AreaVazia = styled.div`
    color: ${({ theme }) => theme.colors.textSecondary};
    text-align: center;
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
`;

export const MiniaturaWeaver = styled.img`
    width: 26px;
    height: 26px;
    border-radius: 8px;
    object-fit: contain;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
`;
