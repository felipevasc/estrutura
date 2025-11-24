import styled from "styled-components";

export const ContainerRecon = styled.div`
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    grid-template-rows: 1fr 35px;
    grid-template-areas:
        "inventory workspace inspector"
        "status status status";
    width: 100%;
    height: 100%; /* Ensure it fills the parent structure */
    min-height: 0; /* Important for grid overflow handling */
    gap: 0; /* Gaps handled by borders/padding inside components if needed, or small gap here */
    background-color: ${({ theme }) => theme.colors.background};
`

export const PainelLateral = styled.aside`
    grid-area: inventory;
    background-color: ${({ theme }) => theme.colors.panelBackground};
    border-right: 1px solid ${({ theme }) => theme.colors.borderColor};
    display: flex;
    flex-direction: column;
    overflow: hidden;
`

export const ConteudoPrincipal = styled.main`
    grid-area: workspace;
    background-color: ${({ theme }) => theme.colors.background}; /* Often slightly different from panel */
    overflow: hidden; /* Internal scrolling */
    display: flex;
    flex-direction: column;
    position: relative;
`

export const PainelInspector = styled.aside`
    grid-area: inspector;
    background-color: ${({ theme }) => theme.colors.panelBackground};
    border-left: 1px solid ${({ theme }) => theme.colors.borderColor};
    display: flex;
    flex-direction: column;
    overflow-y: auto;
`
