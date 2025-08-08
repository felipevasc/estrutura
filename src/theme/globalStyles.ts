import { createGlobalStyle } from 'styled-components'
import fonts from './fonts'

const GlobalStyles = createGlobalStyle`
  ${fonts}

  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.foreground};
    font-family: ${({ theme }) => theme.fontFamily};
    position: relative;
  }

  body, html {
    width: 100%;
    height: 100%;
  }
`

export default GlobalStyles
