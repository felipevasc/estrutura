"use client"
import styled from "styled-components";

export const WorkspaceContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: transparent;
    overflow: hidden;
`

export const BreadcrumbBar = styled.div`
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background: ${({ theme }) => theme.glass.card};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
    gap: 10px;
    font-size: 0.85rem;
    flex-shrink: 0;
    backdrop-filter: blur(5px);

    .separator {
        color: ${({ theme }) => theme.colors.textSecondary};
        font-size: 0.8rem;
    }

    .item {
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        color: ${({ theme }) => theme.colors.textSecondary};
        transition: all 0.2s;

        &:hover {
            background: ${({ theme }) => theme.colors.hoverBackground};
            color: ${({ theme }) => theme.colors.text};
        }
        &.active {
            font-weight: 600;
            color: ${({ theme }) => theme.colors.text};
            background: ${({ theme }) => theme.glass.heavy};
            box-shadow: ${({ theme }) => theme.shadows.soft};
        }
    }
`

export const ContentArea = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
`
