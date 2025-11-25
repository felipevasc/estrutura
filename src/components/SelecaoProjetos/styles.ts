import styled from 'styled-components';

export const DropdownContainer = styled.div`
    position: relative;
    display: inline-block;
`;

export const DropdownButton = styled.button`
    background: ${({ theme }) => theme.glass.card};
    color: ${({ theme }) => theme.colors.text};
    padding: 10px 15px;
    font-size: 0.9rem;
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    cursor: pointer;
    border-radius: ${({ theme }) => theme.borders.radius};
    backdrop-filter: blur(5px);
    transition: all 0.2s;
    box-shadow: ${({ theme }) => theme.shadows.soft};

    &:hover {
        background: ${({ theme }) => theme.colors.hoverBackground};
        border-color: ${({ theme }) => theme.colors.accentColor};
    }
`;

export const DropdownContent = styled.div`
    display: block;
    position: absolute;
    background: ${({ theme }) => theme.glass.heavy};
    min-width: 180px;
    box-shadow: ${({ theme }) => theme.shadows.hard};
    z-index: 200;
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    border-radius: ${({ theme }) => theme.borders.radius};
    backdrop-filter: blur(15px);
    margin-top: 5px;
    padding: 5px;

    a {
        color: ${({ theme }) => theme.colors.text};
        padding: 10px 16px;
        text-decoration: none;
        display: block;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
        font-size: 0.9rem;

        &:hover {
            background: ${({ theme }) => theme.gradients.primary};
            color: #ffffff;
        }
    }
`;
