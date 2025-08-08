const temas = {
  classico: {
    colors: {
      background: '#C0C0C0',
      foreground: '#000000',
      borderColor: '#808080',
      panelBackground: '#D4D0C8',
      accentColor: '#000080',
      hoverBackground: '#0A246A'
    },
    fontFamily: 'Tahoma, sans-serif'
  },
  hacker: {
    colors: {
      background: '#000000',
      foreground: '#00FF00',
      borderColor: '#003B00',
      panelBackground: '#001900',
      accentColor: '#00FF41',
      hoverBackground: '#003B00'
    },
    fontFamily: 'Courier New, monospace'
  },
  fofo: {
    colors: {
      background: '#FFE4F1',
      foreground: '#FF69B4',
      borderColor: '#FFB6C1',
      panelBackground: '#FFF0F5',
      accentColor: '#FF1493',
      hoverBackground: '#FFD1DC'
    },
    fontFamily: 'Comic Sans MS, cursive'
  },
  elegante: {
    colors: {
      background: '#F5F5DC',
      foreground: '#333333',
      borderColor: '#E0E0E0',
      panelBackground: '#FAF0E6',
      accentColor: '#6A5ACD',
      hoverBackground: '#E6E6FA'
    },
    fontFamily: 'Raleway, sans-serif'
  },
  dark: {
    colors: {
      background: '#0D1117',
      foreground: '#C9D1D9',
      borderColor: '#30363D',
      panelBackground: '#161B22',
      accentColor: '#58A6FF',
      hoverBackground: '#21262D'
    },
    fontFamily: 'Rawline, sans-serif'
  },
  clean: {
    colors: {
      background: '#FFFFFF',
      foreground: '#222222',
      borderColor: '#DDDDDD',
      panelBackground: '#F5F5F5',
      accentColor: '#4CAF50',
      hoverBackground: '#EEEEEE'
    },
    fontFamily: 'Arial, sans-serif'
  }
} as const

export type NomeTema = keyof typeof temas

export default temas
