import styled from "styled-components";

export const StyledSelect = styled.select`
    background-color: ${({ theme }) => theme.colors.panelBackground};
    color: ${({ theme }) => theme.colors.foreground};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    padding: 0.25rem;
`;
