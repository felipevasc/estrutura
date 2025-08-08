const temas = {
  classico: {
    colors: {
      background: '#C0C0C0',
      foreground: '#000000',
      borderColor: '#808080',
      panelBackground: '#FFFFFF',
      accentColor: '#000080',
      hoverBackground: '#B8B8B8'
    }
  },
  hacker: {
    colors: {
      background: '#000000',
      foreground: '#00FF41',
      borderColor: '#003B00',
      panelBackground: '#001900',
      accentColor: '#00FF41',
      hoverBackground: '#003B00'
    }
  },
  fofinho: {
    colors: {
      background: '#FFF0F6',
      foreground: '#4D4D4D',
      borderColor: '#FFC1E3',
      panelBackground: '#FFE4F6',
      accentColor: '#FF6F91',
      hoverBackground: '#FFD1E8'
    }
  },
  elegante: {
    colors: {
      background: '#F7F4F2',
      foreground: '#333333',
      borderColor: '#D3CFC9',
      panelBackground: '#FFFFFF',
      accentColor: '#A3B18A',
      hoverBackground: '#E8E4E1'
    }
  },
  caverna: {
    colors: {
      background: '#050505',
      foreground: '#E0E0E0',
      borderColor: '#1F1F1F',
      panelBackground: '#0A0A0A',
      accentColor: '#FFCC00',
      hoverBackground: '#1A1A1A'
    }
  },
  clean: {
    colors: {
      background: '#FAFAFA',
      foreground: '#222222',
      borderColor: '#E0E0E0',
      panelBackground: '#FFFFFF',
      accentColor: '#4CAF50',
      hoverBackground: '#F0F0F0'
    }
  }
} as const

export type TemaType = keyof typeof temas
export default temas
