import styled from "styled-components";

export const ContainerRelatorio = styled.div`
    display: grid;
    grid-template-columns: 360px 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "controls visualization";
    width: 100%;
    flex-grow: 1;
    min-height: 0;
    gap: 15px;
    padding: 10px 15px 15px 15px;
    background: radial-gradient(circle at 20% 20%, rgba(24, 144, 255, 0.08), transparent 35%),
        radial-gradient(circle at 80% 0%, rgba(146, 84, 222, 0.08), transparent 35%);
`;

export const PainelControle = styled.aside`
    grid-area: controls;
    background: ${({ theme }) => theme.glass.default};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: ${({ theme }) => theme.borders.radius};
    display: flex;
    flex-direction: column;
    padding: 18px;
    gap: 14px;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    position: relative;
    isolation: isolate;

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
    padding: 18px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    gap: 10px;
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
    margin-bottom: 6px;
`;

export const DescricaoRelatorio = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0;
`;

export const GradeResumo = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
`;

export const CartaoResumo = styled.div`
    padding: 12px;
    border-radius: ${({ theme }) => theme.borders.radius};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.08), rgba(146, 84, 222, 0.08));
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

export const TituloCartao = styled.span`
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ValorCartao = styled.span`
    font-size: 1.15rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
`;

export const TagSituacao = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(24, 144, 255, 0.4);
    background: rgba(24, 144, 255, 0.08);
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
    font-size: 0.9rem;
`;

export const BlocoControle = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: ${({ theme }) => theme.borders.radius};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    background: rgba(255, 255, 255, 0.02);
`;

export const GradeCampos = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 12px;
`;

export const LinhaResumoVisualizacao = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 10px;
`;

export const BlocoResumoVisualizacao = styled.div`
    padding: 12px 14px;
    border-radius: ${({ theme }) => theme.borders.radius};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    background: rgba(255, 255, 255, 0.02);
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const TituloResumoVisualizacao = styled.span`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.85rem;
`;

export const ValorResumoVisualizacao = styled.span`
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.2rem;
    font-weight: 700;
`;

export const CorpoVisualizacao = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    min-height: 0;
`;

export const ConteudoTabela = styled.div`
    height: 100%;
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: ${({ theme }) => theme.borders.radius};
    padding: 10px;
    background: rgba(255, 255, 255, 0.02);
`;
