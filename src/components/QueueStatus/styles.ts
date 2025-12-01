import styled from 'styled-components';

export const StyledQueueStatus = styled.div`
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;

    .ant-badge {
        cursor: pointer;
    }

    .lista-terminais {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .terminal-cartao {
        background: #0b0f16;
        border: 1px solid #1f2933;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
        overflow: hidden;
    }

    .terminal-barra {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #0f172a;
        padding: 12px 16px;
        color: #e5e7eb;
        border-bottom: 1px solid #1f2937;
    }

    .terminal-titulo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        cursor: pointer;
    }

    .terminal-acoes {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .terminal-dots {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .terminal-dots span {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        display: block;
    }

    .terminal-dots span:nth-child(1) { background: #ef4444; }
    .terminal-dots span:nth-child(2) { background: #f59e0b; }
    .terminal-dots span:nth-child(3) { background: #10b981; }

    .terminal-corpo {
        background: #0b1220;
        padding: 16px;
    }

    .terminal-linha {
        color: #7dd3fc;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .terminal-prompt {
        color: #34d399;
    }

    .terminal-resultado {
        background: #0a101a;
        color: #e5e5e5;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        white-space: pre-wrap;
        word-break: break-word;
        margin: 0;
        border-radius: 6px;
        padding: 12px;
        border: 1px solid #111827;
    }
`;
