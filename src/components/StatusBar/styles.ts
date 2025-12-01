import styled from "styled-components";

export const StyledStatusBar = styled.footer`
    grid-area: status;
    background: ${({ theme }) => theme.gradients.primary};
    color: #fff;
    display: flex;
    align-items: center;
    padding: 8px 15px;
    font-size: 0.85rem;
    height: 100%;
    box-shadow: ${({ theme }) => theme.shadows.glow};
    border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
    backdrop-filter: blur(5px);
`;

export const StatusItem = styled.div`
    margin-right: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
`;

export const AreaTerminais = styled.div`
    .lista-terminais {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .terminal-cartao {
        background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08), transparent 35%), #0a0f1a;
        border: 1px solid #1f2937;
        border-radius: 12px;
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.55);
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease;
    }

    .terminal-cartao:hover {
        transform: translateY(-2px);
        border-color: #2563eb;
        box-shadow: 0 25px 60px rgba(37, 99, 235, 0.15);
    }

    .terminal-barra {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(90deg, #0f172a 0%, #111827 100%);
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
        color: #e2e8f0;
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
        background: #050a14;
        padding: 18px;
    }

    .terminal-cabecalho {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #60a5fa;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 13px;
        margin-bottom: 8px;
        letter-spacing: 0.4px;
    }

    .terminal-sessao {
        color: #a5b4fc;
    }

    .terminal-local {
        color: #6ee7b7;
    }

    .terminal-linha {
        color: #e5e7eb;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
    }

    .terminal-prompt {
        color: #22d3ee;
        font-weight: 700;
    }

    .terminal-comando {
        color: #e5e5e5;
        word-break: break-word;
    }

    .terminal-resultado {
        background: radial-gradient(circle at 10% 20%, rgba(14, 165, 233, 0.08), transparent 45%), #0a0f1a;
        color: #cbd5e1;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        white-space: pre-wrap;
        word-break: break-word;
        margin: 0;
        border-radius: 10px;
        padding: 14px;
        border: 1px solid #0f172a;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    .terminal-resultado pre {
        margin: 0;
        font-size: 13px;
        color: #cbd5e1;
    }
`;
