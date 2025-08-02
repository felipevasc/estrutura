"use client"
import styled from "styled-components";

export const StyledButton = styled.button`
    &:active {
        border-top: 2px solid #aaa;
        border-left: 2px solid #aaa;
        border-bottom: 2px solid #FFF;
        border-right: 2px solid #FFF;
    }
    &.checked {
        background-image: linear-gradient(rgba(var(--interactive-rgb), var(--pressed)), rgba(var(--interactive-rgb), var(--pressed))) !important;
        border-top: 2px solid #aaaa;
        border-left: 2px solid #aaaa;
        border-bottom: 2px solid #FFFe;
        border-right: 2px solid #FFFe;
    
    }
`