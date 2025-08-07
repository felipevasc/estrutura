import styled from "styled-components";

export const StyledArvoreIp = styled.div`
    padding: 1rem;
    background-color: #f4f7f9;

    .ant-tree {
        background-color: transparent;
    }

    .ant-tree-treenode {
        padding: 4px 0;
    }

    .checked > .ant-tree-switcher,
    .checked > .ant-tree-node-content-wrapper {
        background-color: #e6f7ff !important;
        border-left: 2px solid #1890ff;
    }
`;

export const StyledTitleIp = styled.div`
    font-size: 1.2rem;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const StyledTitleIpIcon = styled.div`
    cursor: pointer;
    font-size: 1rem;
    color: #1890ff;
`;
