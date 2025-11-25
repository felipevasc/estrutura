'use client'
import styled from "styled-components";

export const StyledTopo = styled.header`
    height: 60px;
    width: 100%;
    background: ${({ theme }) => theme.glass.default};
    backdrop-filter: blur(10px);
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
    box-shadow: ${({ theme }) => theme.shadows.soft};
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    justify-content: space-between;
    flex-shrink: 0;
    z-index: 100;
    transition: all 0.3s ease;
`
