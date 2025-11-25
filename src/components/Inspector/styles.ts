"use client"
import styled from "styled-components";

export const InspectorContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: transparent;
`

export const InspectorHeader = styled.div`
    padding: 15px;
    background: ${({ theme }) => theme.glass.card};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`

export const InspectorBody = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 15px;

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
    margin-bottom: 25px;
    padding: 10px;
    background: ${({ theme }) => theme.glass.card};
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    box-shadow: ${({ theme }) => theme.shadows.soft};
`

export const PropertyLabel = styled.div`
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-transform: uppercase;
    margin-bottom: 5px;
    font-weight: 700;
    letter-spacing: 0.5px;
`

export const PropertyValue = styled.div`
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.text};
    word-break: break-all;
    font-weight: 500;
`

export const ActionItem = styled.div`
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
`
