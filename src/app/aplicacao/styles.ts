'use client'
import styled from "styled-components";

export const StyledEstruturaInicial = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-height: 100vh;
    padding: 0;
    margin: 0;
    overflow: hidden;
    width: 100%;
    gap: 0;

    .nextjs-toast {
      display: none;
    }
`
export const ModuloContainer = styled.main`
    flex-grow: 1;
    min-height: 0;
    overflow-y: auto;
`;
