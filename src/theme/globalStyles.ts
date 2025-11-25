'use client'
import { createGlobalStyle } from 'styled-components'
import fonts from './fonts'

const GlobalStyles = createGlobalStyle`
  ${fonts}

  :root {
    --background: ${({ theme }) => theme.colors.background};
    --foreground: ${({ theme }) => theme.colors.foreground};
    --border-color: ${({ theme }) => theme.colors.borderColor};
    --panel-background: ${({ theme }) => theme.colors.panelBackground};
    --accent-color: ${({ theme }) => theme.colors.accentColor};
    --hover-background: ${({ theme }) => theme.colors.hoverBackground};
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: ${({ theme }) => theme.gradients.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: 'Rawline', sans-serif;
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    transition: background 0.5s ease, color 0.5s ease;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borderColor};
    border-radius: 4px;

    &:hover {
        background: ${({ theme }) => theme.colors.accentColor};
    }
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }
`
