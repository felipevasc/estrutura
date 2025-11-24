"use client"
import styled from "styled-components";

export const StyledExplorer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
`

export const ExplorerHeader = styled.div`
    flex-shrink: 0;
    padding: 10px;
    background-color: ${({ theme }) => theme.colors.panelBackground};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
    display: flex;
    flex-direction: column;
    gap: 10px;
`

export const ExplorerBody = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px 0;

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
    border-radius: 6px;
    padding: 4px;
    gap: 4px;
    justify-content: space-between;

    & button {
        flex: 1;
        border: none;
        background: transparent;
        color: ${({ theme }) => theme.colors.foreground};
        opacity: 0.6;
        border-radius: 4px;
        height: 30px;
        min-width: 0; /* allows shrinking */

        &:hover {
            background-color: ${({ theme }) => theme.colors.hoverBackground};
            opacity: 1;
        }

        &.active {
            background-color: ${({ theme }) => theme.colors.panelBackground};
            color: ${({ theme }) => theme.colors.accentColor};
            opacity: 1;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
    }
`
