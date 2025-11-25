"use client"
import styled from "styled-components";

export const StyledExplorer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: transparent;
`

export const ExplorerHeader = styled.div`
    flex-shrink: 0;
    padding: 15px;
    background: ${({ theme }) => theme.glass.card};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
    display: flex;
    flex-direction: column;
    gap: 10px;
`

export const ExplorerBody = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px 0;
    background: transparent;

    /* Custom Scrollbar */
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
`

export const StyledMenuExplorer = styled.div`
    display: flex;
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: 8px;
    padding: 4px;
    gap: 4px;
    justify-content: space-between;
    box-shadow: ${({ theme }) => theme.shadows.inner};

    & button {
        flex: 1;
        border: none;
        background: transparent;
        color: ${({ theme }) => theme.colors.textSecondary};
        opacity: 0.8;
        border-radius: 6px;
        height: 32px;
        min-width: 0;
        font-weight: 500;
        transition: all 0.2s;

        &:hover {
            background-color: ${({ theme }) => theme.colors.hoverBackground};
            color: ${({ theme }) => theme.colors.text};
            opacity: 1;
        }

        &.active {
            background: ${({ theme }) => theme.gradients.primary};
            color: #ffffff;
            opacity: 1;
            box-shadow: ${({ theme }) => theme.shadows.soft};
        }
    }
`
