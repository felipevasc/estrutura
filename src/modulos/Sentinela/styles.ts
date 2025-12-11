import styled from "styled-components";

export const ContainerSentinela = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    height: 100%;
    overflow: hidden;
`;

export const AreaConteudo = styled.div`
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 16px;
    flex: 1;
    min-height: 0;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

export const CartaoFormulario = styled.div`
    background: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
`;

export const CartaoLista = styled.div`
    background: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    min-height: 0;

    .tabela-agendamentos {
        flex: 1;
    }
`;
