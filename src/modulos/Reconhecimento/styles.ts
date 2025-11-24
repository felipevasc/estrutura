import styled from "styled-components";

export const ContainerRecon = styled.div`
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    grid-template-rows: 1fr 35px;
    grid-template-areas:
        "inventory workspace inspector"
        "status status status";
    width: 100%;
    /* Remove fixed height: 100% to avoid overflow in flex container */
    flex-grow: 1;
    min-height: 0; /* Important for grid overflow handling in flex child */
    gap: 0;
    background-color: ${({ theme }) => theme.colors.background};
    /* Ensure borders don't add to width if box-sizing is not border-box (usually it is globally, but safe to assume) */
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
    background-color: ${({ theme }) => theme.colors.background};
    overflow: hidden;
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
