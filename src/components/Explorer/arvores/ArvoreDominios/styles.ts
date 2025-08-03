import styled from "styled-components";

export const StyledTitleDominio = styled.div`
    width: 100%;
    position: relative;
    padding-top: 12px;
    padding-bottom: 12px;
    font-weight: bold;
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
    & .ant-tree-list-holder-inner .ant-tree-node-content-wrapper {
        font-weight: bold;
        font-family: 'Roboto', sans-serif;
    }
    & .ant-tree-list-holder-inner .dominio .ant-tree-node-content-wrapper {
        color: #071540;
    }
    & .ant-tree-list-holder-inner .checked .ant-tree-node-content-wrapper {
        background-color: #071540;
        color: #FFF !important;
    }
`