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
        color: #333;
        margin-bottom: 0.5rem;
        font-weight: bold;
    }

    input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        color: #000;
        background-color: #fff;
    }

    .actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
`;
