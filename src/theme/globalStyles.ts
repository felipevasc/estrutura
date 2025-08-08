import { createGlobalStyle } from 'styled-components';
import fonts from './fonts';

const GlobalStyles = createGlobalStyle`
  ${fonts}
  body {
    --background: ${({ theme }) => theme.colors.background};
    --foreground: ${({ theme }) => theme.colors.foreground};
    --border-color: ${({ theme }) => theme.colors.borderColor};
    --panel-background: ${({ theme }) => theme.colors.panelBackground};
    --accent-color: ${({ theme }) => theme.colors.accentColor};
    --hover-background: ${({ theme }) => theme.colors.hoverBackground};
    background: var(--background);
    color: var(--foreground);
    font-family: 'Rawline', sans-serif;
    position: relative;
  }
  body, html {
    width: 100%;
    height: 100%;
  }
`;

export default GlobalStyles;
