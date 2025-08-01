'use client'

import styled from "styled-components"

export const StyledMenuEsquerdo = styled.div`
    height: 100%;
    padding: 0;
    margin: 0;
    background-color: var(--panel-background);
    border: 1px solid var(--border-color);
    
    & .br-menu, & .menu-container {
        height: 100%;
        background-color: var(--panel-background);
    }

    & .br-item {
        color: var(--foreground);
        &:hover {
            background-color: var(--hover-background);
        }
    }
`