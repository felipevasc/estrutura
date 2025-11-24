import styled from "styled-components";

export const ContainerRecon = styled.div`
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
    width: 100%;
    gap: 1rem;
    padding: 1rem;
    min-height: 0;
    overflow: hidden;
`

export const ConteudoPrincipal = styled.main`
    flex-grow: 1;
    padding: 1rem;
    overflow-y: auto;
    background-color: ${({ theme }) => theme.colors.panelBackground};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: 6px;
`

export const PainelLateral = styled.aside`
    width: 250px;
    flex-shrink: 0;
    padding: 1rem;
    overflow-y: auto;
    background-color: ${({ theme }) => theme.colors.panelBackground};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: 6px;
`
