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

      // Extended Palette
      primary: string
      secondary: string
      success: string
      warning: string
      error: string
      info: string
      text: string
      textSecondary: string
    }

    gradients: {
      background: string
      surface: string
      primary: string
      secondary: string
      card: string
    }

    shadows: {
      soft: string
      medium: string
      hard: string
      glow: string
      inner: string
    }

    glass: {
      default: string
      heavy: string
      card: string
    }

    borders: {
      radius: string
      width: string
      color: string
    }

    // Layout properties
    gridColumns: string
    gridAreas: string
    direcaoLayout: string
  }
}
