import styled from "styled-components";

export const StyledTitleDominio = styled.div`
    width: 100%;
    padding-top: 12px;
    padding-bottom: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;
`

export const StyledTitleDominioIcon = styled.div`
    display: flex;
    gap: 8px;
    margin-left: auto;
    align-items: center;
    & button {
        color: var(--accent-color);
    }
`

export const StyledArvoreDominio = styled.div`
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

    /* Style for different node types */
    .ant-tree-list-holder-inner .dominio .ant-tree-node-content-wrapper {
        color: var(--accent-color);
        font-weight: 500;
    }

    .ant-tree-list-holder-inner .ip .ant-tree-node-content-wrapper {
        color: #8B949E; /* A secondary color from the theme */
    }

    /* Adjust switcher (arrow icon) style */
    .ant-tree .ant-tree-switcher {
        color: var(--foreground);
    }
`