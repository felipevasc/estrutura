import styled from "styled-components";

export const StyledTitleDominio = styled.div`
    width: 100%;
    position: relative;
    padding-top: 12px;
    padding-bottom: 12px;
    font-weight: bold;
    display: flex;
`

export const StyledTitleDominioIcon = styled.div`
    position: absolute;
    right: 0px;
    top: 4px;
    & button {
        color: #0F0;
    }
`

export const StyledArvoreDominio = styled.div`
    &.ant-tree .ant-tree-node-content-wrapper {
        padding: 0;
    }
    & .ant-tree, & .ant-tree svg {
        font-size: 10px;
    }
    & .ant-tree {
        overflow: auto;
        max-height: calc(100vh - 260px);
    }
    & .ant-tree-list-holder-inner .ant-tree-node-content-wrapper {
        font-family: monospace;
        white-space: nowrap;
        text-align: left;
        padding-inline: 0;
    }
    & .ant-tree-list-holder-inner .folder .ant-tree-node-content-wrapper {
        color:rgb(64, 18, 7);
        font-weight: bolder;
    }
    & .ant-tree-list-holder-inner .dominio .ant-tree-node-content-wrapper {
        color: #071540;
    }
    & .ant-tree-list-holder-inner .ip .ant-tree-node-content-wrapper {
        color:rgb(105, 73, 13);
    }
    & .ant-tree-list-holder-inner .checked .ant-tree-node-content-wrapper {
        background-color: #071540;
        color: #FFF !important;
    }
`