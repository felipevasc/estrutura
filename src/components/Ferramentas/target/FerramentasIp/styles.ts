import styled from "styled-components";

export const StyledFerramentasIp = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    padding: 1rem;

    .ant-card {
        cursor: pointer;
        transition: all 0.3s ease;
        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
    }
`;
