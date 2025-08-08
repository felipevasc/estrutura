import styled from 'styled-components';

export const FormContainer = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .field {
        display: flex;
        flex-direction: column;
    }

    label {
        color: ${({ theme }) => theme.colors.foreground};
        margin-bottom: 0.5rem;
        font-weight: bold;
    }

    input {
        padding: 0.5rem;
        border: 1px solid ${({ theme }) => theme.colors.borderColor};
        border-radius: 4px;
        color: ${({ theme }) => theme.colors.foreground};
        background-color: ${({ theme }) => theme.colors.background};
    }

    .actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
`;
