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
        margin-bottom: 8px;        
        background-color: #c5d4eb;
        transition: 0.3s;

        &:hover {
            background-color: #cfdef6;
        }
        &:active {
            background-color: #c5d4eb;
            /* box-shadow inside the box */
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);

            transform: scale(0.98);
            opacity: 0.9;
            
            cursor: pointer;
            border-top:rgb(69, 78, 92) solid 4px;
            border-right: rgb(69, 78, 92) solid 4px;
            border-left:rgb(204, 220, 226) solid 4px;
            border-bottom: #ddf5ff solid 4px;
        }
    }
    & .ant-card-head {
        text-align: center;
        min-height: 20px;
    }
    & .ant-card-body {
        padding: 4px 8px;
        & * {
            color: #333;
        }
    }
`