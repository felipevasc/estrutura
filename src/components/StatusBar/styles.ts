import styled from "styled-components";

export const StyledStatusBar = styled.footer`
    grid-area: status;
    background-color: ${({ theme }) => theme.colors.accentColor};
    color: #fff;
    display: flex;
    align-items: center;
    padding: 0 10px;
    font-size: 0.85rem;
    height: 100%;

    // Fallback for contrast if accent is too bright/dark, usually handled by theme,
    // but here we just ensure basic visibility
`;

export const StatusItem = styled.div`
    margin-right: 15px;
    display: flex;
    align-items: center;
    gap: 5px;
`;
