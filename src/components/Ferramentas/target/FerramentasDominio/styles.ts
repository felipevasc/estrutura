import styled from "styled-components";

export const StyledFerramentasDominio = styled.div`
    & .ant-card {
        cursor: pointer;
        border-top: #ddf5ff solid 4px;
        border-right: #ddf5ff solid 4px;
        border-left: #65748b solid 4px;
        border-bottom: #65748b solid 4px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        transition: 0.3s;
        

        background-color: #c5d4eb;
        &:hover {
            background-color: #c5d4ebdd;
        }
            margin-bottom: 8px;
    }
    & .ant-card-head {
        text-align: center;
    }
    & .ant-card-body {
        padding: 4px 8px;
        & * {
            color: #333;
        }
    }
`