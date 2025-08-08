import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string
      foreground: string
      borderColor: string
      panelBackground: string
      accentColor: string
      hoverBackground: string
    }
  }
}
