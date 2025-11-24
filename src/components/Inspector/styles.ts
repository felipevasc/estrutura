"use client"
import styled from "styled-components";

export const InspectorContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`

export const InspectorHeader = styled.div`
    padding: 10px;
    background-color: ${({ theme }) => theme.colors.panelBackground};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`

export const InspectorBody = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;

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

export const PropertyGroup = styled.div`
    margin-bottom: 20px;
`

export const PropertyLabel = styled.div`
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.foreground};
    opacity: 0.7;
    text-transform: uppercase;
    margin-bottom: 5px;
    font-weight: 600;
`

export const PropertyValue = styled.div`
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.foreground};
    word-break: break-all;
`

export const ActionItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background-color: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: 6px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: ${({ theme }) => theme.colors.accentColor};
    }

    .info {
        display: flex;
        flex-direction: column;

        strong {
            font-size: 0.9rem;
        }
        span {
            font-size: 0.75rem;
            opacity: 0.7;
        }
    }
`
