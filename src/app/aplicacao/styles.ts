'use client'
import styled from "styled-components";

export const StyledEstruturaInicial = styled.div`
    display: flex;
    flex-direction: column;
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
    justify-content: space-between;
    flex-grow: 1;
    overflow: hidden;
    width: 100%;
    gap: 1rem;
    padding: 1rem;
`

export const StyledConteudoPrincipal = styled.main`
    flex-grow: 1;
    padding: 1rem;
    overflow-y: auto;
    background-color: var(--panel-background);
    border: 1px solid var(--border-color);
`

export const StyledPainelDireito = styled.aside`
    width: 250px;
    flex-shrink: 0;
    padding: 1rem;
    overflow-y: auto;
    background-color: var(--panel-background);
    border: 1px solid var(--border-color);
`

export const StyledPainelEsquerdo = styled.aside`
    width: 250px;
    flex-shrink: 0;
    padding: 1rem;
    overflow-y: auto;
    background-color: var(--panel-background);
    border: 1px solid var(--border-color);
`