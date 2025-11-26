import styled from "styled-components";

export const ContainerRecon = styled.div`
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    grid-template-rows: 1fr 35px;
    grid-template-areas:
        "inventory workspace inspector"
        "status status status";
    width: 100%;
    flex-grow: 1;
    min-height: 0;
    gap: 15px;
    padding: 0 15px 15px 15px; /* Top padding is 0 because of navigation */
    background: transparent;
    height: calc(100vh - 100px);
`

export const PainelLateral = styled.aside`
    grid-area: inventory;
    background: ${({ theme }) => theme.glass.default};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: ${({ theme }) => theme.borders.radius};
    box-shadow: ${({ theme }) => theme.shadows.soft};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s ease;
`

export const ConteudoPrincipal = styled.main`
    grid-area: workspace;
    background: ${({ theme }) => theme.glass.default};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: ${({ theme }) => theme.borders.radius};
    box-shadow: ${({ theme }) => theme.shadows.soft};
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.3s ease;
`

export const PainelInspector = styled.aside`
    grid-area: inspector;
    background: ${({ theme }) => theme.glass.default};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: ${({ theme }) => theme.borders.radius};
    box-shadow: ${({ theme }) => theme.shadows.soft};
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    transition: all 0.3s ease;
`
