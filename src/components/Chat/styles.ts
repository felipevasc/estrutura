import styled from 'styled-components';
import { Drawer as AntDrawer } from 'antd';

export const ChatButtonContainer = styled.div`
    /* Used to position the float button if not using Antd FloatButton default */
`;

// @ts-ignore - Fixing TS4023
export const StyledDrawer = styled(AntDrawer)`
    .ant-drawer-body {
        padding: 0;
        display: flex;
        flex-direction: column;
        background-color: #1e1e1e;
        color: #d4d4d4;
    }
    .ant-drawer-header {
        background-color: #252526;
        border-bottom: 1px solid #3e3e42;
        color: #cccccc;
    }
    .ant-drawer-title {
        color: #cccccc;
    }
    .ant-drawer-close {
        color: #cccccc;
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
`;

export const InputArea = styled.div`
    padding: 15px;
    background-color: #252526;
    border-top: 1px solid #3e3e42;
    display: flex;
    gap: 10px;
    align-items: flex-end;
`;

export const MessageBubble = styled.div<{ $isUser: boolean }>`
    background-color: ${props => props.$isUser ? '#0e639c' : '#3e3e42'};
    color: #ffffff;
    padding: 10px 15px;
    border-radius: 12px;
    border-bottom-left-radius: ${props => props.$isUser ? '12px' : '0'};
    border-bottom-right-radius: ${props => props.$isUser ? '0' : '12px'};
    max-width: 90%;
    align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
    white-space: pre-wrap;
    word-break: break-word;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

export const CommandBlock = styled.div`
    background-color: #000000;
    border: 1px solid #555;
    border-radius: 6px;
    margin-top: 8px;
    overflow: hidden;
    max-width: 90%;
    align-self: flex-start;
`;

export const CommandHeader = styled.div`
    background-color: #333;
    padding: 5px 10px;
    font-size: 11px;
    color: #aaa;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
`;

export const CommandContent = styled.div`
    padding: 10px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    color: #00ff00;
`;

export const CommandActions = styled.div`
    padding: 5px 10px;
    background-color: #222;
    border-top: 1px solid #333;
    display: flex;
    justify-content: flex-end;
`;
