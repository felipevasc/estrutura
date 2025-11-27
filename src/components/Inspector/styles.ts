"use client"
import styled from "styled-components";

export const InspectorContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: transparent;
`;

export const CorpoInspector = styled.div`
    display: grid;
    grid-template-columns: 1fr 70px;
    height: 100%;
    background: ${({ theme }) => theme.glass.card};
`;

export const AreaConteudo = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

export const ColunaAbas = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px 10px;
    border-left: 1px solid ${({ theme }) => theme.colors.borderColor};
    background: ${({ theme }) => theme.glass.default};
`;

export const BotaoAba = styled.button<{ $ativo: boolean }>`
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: 1px solid ${({ theme, $ativo }) => $ativo ? theme.colors.accentColor : theme.colors.borderColor};
    background: ${({ theme, $ativo }) => $ativo ? theme.colors.hoverBackground : theme.glass.card};
    color: ${({ theme }) => theme.colors.text};
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${({ theme }) => theme.shadows.soft};

    &:hover {
        border-color: ${({ theme }) => theme.colors.accentColor};
        box-shadow: ${({ theme }) => theme.shadows.medium};
    }

    &:active {
        transform: translateY(1px);
        box-shadow: ${({ theme }) => theme.shadows.inner};
    }

    svg {
        font-size: 18px;
    }
`;

export const InspectorBody = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 15px;
    background: ${({ theme }) => theme.glass.default};

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colors.borderColor};
        border-radius: 3px;
    }
`;

export const ItemAcao = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: ${({ theme }) => theme.glass.card};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: ${({ theme }) => theme.shadows.soft};

    &:hover {
        border-color: ${({ theme }) => theme.colors.accentColor};
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => theme.shadows.medium};
        background: ${({ theme }) => theme.colors.hoverBackground};
    }

    &:active {
        transform: translateY(0);
        box-shadow: ${({ theme }) => theme.shadows.inner};
    }

    .info {
        display: flex;
        flex-direction: column;

        strong {
            font-size: 0.95rem;
            color: ${({ theme }) => theme.colors.text};
        }
        span {
            font-size: 0.75rem;
            opacity: 0.7;
            color: ${({ theme }) => theme.colors.textSecondary};
        }
    }
`;

export const TituloGrupo = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 12px;
`;

export const DescricaoGrupo = styled.div`
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 18px;
`;
