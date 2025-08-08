'use client'

import styled from "styled-components"

export const StyledMenuEsquerdo = styled.div`
    height: 100%;
    padding: 0;
    margin: 0;
    background-color: ${({ theme }) => theme.colors.panelBackground};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    
    & .br-menu, & .menu-container {
        height: 100%;
        background-color: ${({ theme }) => theme.colors.panelBackground};
    }

    & .br-item {
        color: ${({ theme }) => theme.colors.foreground};
        &:hover {
            background-color: ${({ theme }) => theme.colors.hoverBackground};
        }
    }
`