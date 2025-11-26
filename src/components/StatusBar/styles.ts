import styled from "styled-components";

export const StyledStatusBar = styled.footer`
    grid-area: status;
    background: ${({ theme }) => theme.gradients.primary};
    color: #fff;
    display: flex;
    align-items: center;
    padding: 8px 15px;
    font-size: 0.85rem;
    height: 100%;
    box-shadow: ${({ theme }) => theme.shadows.glow};
    border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
    backdrop-filter: blur(5px);
`;

export const StatusItem = styled.div`
    margin-right: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
`;
