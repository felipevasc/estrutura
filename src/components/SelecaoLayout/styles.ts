import styled from 'styled-components'

export const DropdownContainer = styled.div`
    position: relative;
    display: inline-block;
`

export const DropdownButton = styled.button`
    background-color: ${({ theme }) => theme.colors.panelBackground};
    color: ${({ theme }) => theme.colors.foreground};
    padding: 10px;
    font-size: 16px;
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    cursor: pointer;
`

export const DropdownContent = styled.div`
    display: block;
    position: absolute;
    background-color: ${({ theme }) => theme.colors.panelBackground};
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
    border: 1px solid ${({ theme }) => theme.colors.borderColor};

    a {
        color: ${({ theme }) => theme.colors.foreground};
        padding: 12px 16px;
        text-decoration: none;
        display: block;
        cursor: pointer;

        &:hover {
            background-color: ${({ theme }) => theme.colors.hoverBackground};
        }
    }
`
