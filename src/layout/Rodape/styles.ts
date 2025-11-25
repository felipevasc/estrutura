'use client'
import styled from "styled-components";

export const StyledRodape = styled.footer`
    height: 40px;
    width: 100%;
    background: ${({ theme }) => theme.glass.default};
    backdrop-filter: blur(10px);
    border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;
    font-size: 0.8rem;
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    z-index: 100;
    transition: all 0.3s ease;
`
