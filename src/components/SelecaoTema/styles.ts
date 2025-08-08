import styled from 'styled-components';

export const SelectTema = styled.select`
    background-color: ${({ theme }) => theme.colors.panelBackground};
    color: ${({ theme }) => theme.colors.foreground};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
`;
