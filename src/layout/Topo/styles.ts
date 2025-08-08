'use client'
import styled from "styled-components"

export const StyledTopo = styled.header`
    height: 50px;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.panelBackground};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
    display: flex;
    align-items: center;
    padding: 0 1rem;
    justify-content: space-between;
    flex-shrink: 0;
`

export const ContainerSelecao = styled.div`
    display: flex;
    gap: 0.5rem;
`
