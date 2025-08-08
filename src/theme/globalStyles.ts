// Arquivo: src/theme/globalStyles.ts
import { createGlobalStyle } from 'styled-components';
import fonts from './fonts';
import theme from './theme';

const GlobalStyles = createGlobalStyle`
  ${fonts}

  body {
    background: ${theme.colors.background};
    color: ${theme.colors.foreground};
    font-family: 'Rawline', sans-serif;
    position: relative;
  }

  body, html {
    width: 100%;
    height: 100%;
  }
`;

export default GlobalStyles;
