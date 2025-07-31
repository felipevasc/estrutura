'use client'
import styled from "styled-components";

export const StyledEstruturaInicial = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-height: 100vh;
    padding: 0;
    margin: 0;
    overflow: hidden;
    width: 100%;
    gap: 0;
`

export const StyledEstruturaCentro = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: calc(100vh - 50px - 50px);
    padding: 0;
    padding-right: 4px;
    margin: 0;
    overflow: hidden;
    width: 100%;
    gap: 4px;
    background-color: #f0f0f0`