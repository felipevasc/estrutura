import 'styled-components'
import temas from './theme/temas'

type Tema = typeof temas[keyof typeof temas]

declare module 'styled-components' {
  export interface DefaultTheme extends Tema {}
}

export {}
