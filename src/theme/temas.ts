import { DefaultTheme } from 'styled-components'

const temas: Record<string, DefaultTheme> = {
  classico: {
    colors: {
      background: '#C0C0C0',
      foreground: '#000000',
      borderColor: '#000000',
      panelBackground: '#FFFFFF',
      accentColor: '#000080',
      hoverBackground: '#A0A0A0'
    }
  },
  hacker: {
    colors: {
      background: '#000000',
      foreground: '#00FF00',
      borderColor: '#003300',
      panelBackground: '#000000',
      accentColor: '#00FF00',
      hoverBackground: '#001900'
    }
  },
  fofinho: {
    colors: {
      background: '#FFF0F6',
      foreground: '#8B5CF6',
      borderColor: '#FBCFE8',
      panelBackground: '#FFE4F3',
      accentColor: '#F472B6',
      hoverBackground: '#FDEDF6'
    }
  },
  elegante: {
    colors: {
      background: '#F5F5F4',
      foreground: '#1F2937',
      borderColor: '#E5E7EB',
      panelBackground: '#FFFFFF',
      accentColor: '#6B7280',
      hoverBackground: '#EDEDED'
    }
  },
  dark: {
    colors: {
      background: '#0A0A0A',
      foreground: '#F5F5F5',
      borderColor: '#1F1F1F',
      panelBackground: '#141414',
      accentColor: '#FFD700',
      hoverBackground: '#1A1A1A'
    }
  },
  clean: {
    colors: {
      background: '#FFFFFF',
      foreground: '#111827',
      borderColor: '#D1D5DB',
      panelBackground: '#F9FAFB',
      accentColor: '#3B82F6',
      hoverBackground: '#E5E7EB'
    }
  }
}

export default temas
