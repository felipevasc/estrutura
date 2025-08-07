import styled from 'styled-components';

export const DropdownContainer = styled.div`
    position: relative;
    display: inline-block;
`;

export const DropdownButton = styled.button`
    background-color: #f1f1f1;
    color: #333;
    padding: 10px;
    font-size: 16px;
    border: none;
    cursor: pointer;
`;

export const DropdownContent = styled.div`
    display: block;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;

    a {
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
        cursor: pointer;

        &:hover {
            background-color: #f1f1f1;
        }
    }
`;
