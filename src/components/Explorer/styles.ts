"use client"
import styled from "styled-components";

export const StyledExplorer = styled.div`
    width: 100%;
    max-height: calc(100% - 16px);
    overflow: none;
`

export const StyledMenuExplorer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;

    & button {
        margin: 0;
        border-radius: 0;
    }
    & > button:first-child {
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
    } 
    & > button:last-child {
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
    }
`