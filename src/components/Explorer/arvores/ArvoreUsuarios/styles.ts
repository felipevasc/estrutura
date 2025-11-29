import styled from "styled-components";

export const StyledTitleUsuario = styled.div`
    width: 100%;
    padding-top: 12px;
    padding-bottom: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const StyledArvoreUsuario = styled.div`
    .ant-tree {
        background-color: transparent;
        font-family: var(--font-geist-mono), monospace;
        font-size: 14px;
        color: var(--foreground);
        overflow: auto;
        max-height: calc(100vh - 260px);
    }

    .ant-tree .ant-tree-node-content-wrapper {
        padding: 2px 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
        white-space: nowrap;
    }

    .ant-tree .ant-tree-node-content-wrapper:hover {
        background-color: var(--hover-background);
    }

    .ant-tree.ant-tree-directory .ant-tree-treenode-selected .ant-tree-node-content-wrapper::before,
    .ant-tree.ant-tree-directory .ant-tree-treenode-selected .ant-tree-node-content-wrapper {
        background-color: var(--accent-color);
        color: #0D1117;
    }

    .ant-tree-list-holder-inner .usuario .ant-tree-node-content-wrapper {
        color: var(--accent-color);
        font-weight: 500;
    }

    .ant-tree .ant-tree-switcher {
        color: var(--foreground);
    }
`;
