import styled from "styled-components";

export const ContainerRelatorio = styled.div`
    display: grid;
    grid-template-columns: 320px 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "controls visualization";
    width: 100%;
    flex-grow: 1;
    min-height: 0;
    gap: 15px;
    padding: 0 15px 15px 15px;
    background: transparent;
`;

export const PainelControle = styled.aside`
    grid-area: controls;
    background: ${({ theme }) => theme.glass.default};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: ${({ theme }) => theme.borders.radius};
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    overflow-y: auto;

    h3 {
        color: ${({ theme }) => theme.colors.text};
        font-size: 1.1em;
        margin-bottom: 10px;
        border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
        padding-bottom: 5px;
    }
`;

export const AreaVisualizacao = styled.main`
    grid-area: visualization;
    background: ${({ theme }) => theme.glass.default};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: ${({ theme }) => theme.borders.radius};
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
    position: relative;
`;

export const ChartContainer = styled.div`
    flex-grow: 1;
    min-height: 0;
    width: 100%;
    margin-top: 20px;
`;

export const Toolbar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

export const CabecalhoVisualizacao = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
`;

export const DescricaoRelatorio = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0;
`;
