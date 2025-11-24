"use client"
import styled from "styled-components";

export const WorkspaceContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.background};
    overflow: hidden;
`

export const BreadcrumbBar = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 15px;
    background-color: ${({ theme }) => theme.colors.panelBackground};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
    gap: 10px;
    font-size: 0.9rem;
    flex-shrink: 0;

    .separator {
        color: ${({ theme }) => theme.colors.borderColor};
        font-size: 0.8rem;
    }

    .item {
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        &:hover {
            background-color: ${({ theme }) => theme.colors.hoverBackground};
        }
        &.active {
            font-weight: 600;
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
