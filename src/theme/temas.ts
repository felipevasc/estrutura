import { DefaultTheme } from 'styled-components'

const defaultLayout = {
  gridColumns: "260px 1fr 300px",
  gridAreas: `
    "left top right"
    "left main right"
    "left footer right"
  `,
  direcaoLayout: "column"
};

const temas: Record<string, DefaultTheme> = {
  classico: { // Modern Metallic
    colors: {
      background: '#e0e0e0',
      foreground: '#1a1a1a',
      borderColor: '#b0b0b0',
      panelBackground: '#f5f5f5',
      accentColor: '#2c3e50',
      hoverBackground: '#dcdcdc',
      primary: '#2c3e50',
      secondary: '#7f8c8d',
      success: '#27ae60',
      warning: '#f39c12',
      error: '#c0392b',
      info: '#2980b9',
      text: '#1a1a1a',
      textSecondary: '#555555'
    },
    gradients: {
      background: 'linear-gradient(135deg, #e0e0e0 0%, #cfcfcf 100%)',
      surface: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
      primary: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      secondary: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)',
      card: 'linear-gradient(145deg, #ffffff, #f0f0f0)'
    },
    shadows: {
      soft: '5px 5px 10px #bebebe, -5px -5px 10px #ffffff',
      medium: '8px 8px 16px #bebebe, -8px -8px 16px #ffffff',
      hard: '10px 10px 20px #bebebe, -10px -10px 20px #ffffff',
      glow: '0 0 15px rgba(44, 62, 80, 0.3)',
      inner: 'inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff'
    },
    glass: {
      default: 'rgba(255, 255, 255, 0.7)',
      heavy: 'rgba(255, 255, 255, 0.9)',
      card: 'rgba(245, 245, 245, 0.8)'
    },
    borders: {
      radius: '12px',
      width: '1px',
      color: '#b0b0b0'
    },
    ...defaultLayout
  },
  hacker: { // Cyberpunk Neon
    colors: {
      background: '#050505',
      foreground: '#00ff41',
      borderColor: '#003300',
      panelBackground: '#0a0a0a',
      accentColor: '#00ff41',
      hoverBackground: '#0f0f0f',
      primary: '#00ff41',
      secondary: '#008f11',
      success: '#00ff41',
      warning: '#f1c40f',
      error: '#ff0033',
      info: '#00ffff',
      text: '#e0e0e0',
      textSecondary: '#008f11'
    },
    gradients: {
      background: 'radial-gradient(circle at center, #111 0%, #000 100%)',
      surface: 'linear-gradient(180deg, rgba(10,10,10,0.9) 0%, rgba(5,5,5,0.95) 100%)',
      primary: 'linear-gradient(90deg, #00ff41, #008f11)',
      secondary: 'linear-gradient(90deg, #008f11, #003300)',
      card: 'linear-gradient(145deg, #0f0f0f, #050505)'
    },
    shadows: {
      soft: '0 0 10px rgba(0, 255, 65, 0.1)',
      medium: '0 0 20px rgba(0, 255, 65, 0.2)',
      hard: '0 0 30px rgba(0, 255, 65, 0.4)',
      glow: '0 0 15px #00ff41',
      inner: 'inset 0 0 15px rgba(0, 255, 65, 0.1)'
    },
    glass: {
      default: 'rgba(10, 10, 10, 0.8)',
      heavy: 'rgba(0, 0, 0, 0.9)',
      card: 'rgba(20, 20, 20, 0.7)'
    },
    borders: {
      radius: '4px',
      width: '1px',
      color: '#00ff41'
    },
    ...defaultLayout
  },
  fofinho: { // Vaporwave/Vivid
    colors: {
      background: '#240046',
      foreground: '#e0aaff',
      borderColor: '#7b2cbf',
      panelBackground: '#3c096c',
      accentColor: '#ff006e',
      hoverBackground: '#5a189a',
      primary: '#ff006e',
      secondary: '#8338ec',
      success: '#06d6a0',
      warning: '#ffbe0b',
      error: '#ef233c',
      info: '#4361ee',
      text: '#e0aaff',
      textSecondary: '#c77dff'
    },
    gradients: {
      background: 'linear-gradient(135deg, #240046 0%, #10002b 100%)',
      surface: 'linear-gradient(135deg, rgba(60, 9, 108, 0.6) 0%, rgba(36, 0, 70, 0.6) 100%)',
      primary: 'linear-gradient(45deg, #ff006e, #8338ec)',
      secondary: 'linear-gradient(45deg, #3a86ff, #8338ec)',
      card: 'linear-gradient(145deg, #3c096c, #240046)'
    },
    shadows: {
      soft: '0 4px 20px rgba(255, 0, 110, 0.2)',
      medium: '0 8px 30px rgba(131, 56, 236, 0.3)',
      hard: '0 10px 40px rgba(58, 134, 255, 0.4)',
      glow: '0 0 20px #ff006e',
      inner: 'inset 0 0 20px rgba(255, 0, 110, 0.2)'
    },
    glass: {
      default: 'rgba(60, 9, 108, 0.4)',
      heavy: 'rgba(36, 0, 70, 0.8)',
      card: 'rgba(60, 9, 108, 0.5)'
    },
    borders: {
      radius: '20px',
      width: '2px',
      color: '#7b2cbf'
    },
    ...defaultLayout
  },
  elegante: { // Cinematic Gold/Dark
    colors: {
      background: '#121212',
      foreground: '#d4af37',
      borderColor: '#333333',
      panelBackground: '#1e1e1e',
      accentColor: '#d4af37',
      hoverBackground: '#2d2d2d',
      primary: '#d4af37',
      secondary: '#a08528',
      success: '#27ae60',
      warning: '#f39c12',
      error: '#c0392b',
      info: '#95a5a6',
      text: '#e0e0e0',
      textSecondary: '#888888'
    },
    gradients: {
      background: 'linear-gradient(to bottom, #121212, #000000)',
      surface: 'linear-gradient(145deg, #1e1e1e, #121212)',
      primary: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
      secondary: 'linear-gradient(135deg, #444 0%, #222 100%)',
      card: 'linear-gradient(145deg, #252525, #1a1a1a)'
    },
    shadows: {
      soft: '0 4px 6px rgba(0, 0, 0, 0.5)',
      medium: '0 10px 15px rgba(0, 0, 0, 0.7)',
      hard: '0 20px 25px rgba(0, 0, 0, 0.9)',
      glow: '0 0 15px rgba(212, 175, 55, 0.3)',
      inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)'
    },
    glass: {
      default: 'rgba(30, 30, 30, 0.6)',
      heavy: 'rgba(18, 18, 18, 0.9)',
      card: 'rgba(40, 40, 40, 0.5)'
    },
    borders: {
      radius: '8px',
      width: '1px',
      color: '#d4af37'
    },
    ...defaultLayout
  },
  dark: { // Deep Space Blue
    colors: {
      background: '#0f172a',
      foreground: '#e2e8f0',
      borderColor: '#1e293b',
      panelBackground: '#1e293b',
      accentColor: '#38bdf8',
      hoverBackground: '#334155',
      primary: '#38bdf8',
      secondary: '#0ea5e9',
      success: '#4ade80',
      warning: '#facc15',
      error: '#f87171',
      info: '#38bdf8',
      text: '#f1f5f9',
      textSecondary: '#94a3b8'
    },
    gradients: {
      background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
      surface: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
      primary: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
      secondary: 'linear-gradient(135deg, #818cf8, #6366f1)',
      card: 'linear-gradient(145deg, #1e293b, #0f172a)'
    },
    shadows: {
      soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      hard: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      glow: '0 0 20px rgba(56, 189, 248, 0.4)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
    },
    glass: {
      default: 'rgba(30, 41, 59, 0.7)',
      heavy: 'rgba(15, 23, 42, 0.9)',
      card: 'rgba(30, 41, 59, 0.5)'
    },
    borders: {
      radius: '8px',
      width: '1px',
      color: '#1e293b'
    },
    ...defaultLayout
  },
  clean: { // Minimalist Future
    colors: {
      background: '#ffffff',
      foreground: '#374151',
      borderColor: '#e5e7eb',
      panelBackground: '#f9fafb',
      accentColor: '#6366f1',
      hoverBackground: '#f3f4f6',
      primary: '#6366f1',
      secondary: '#4f46e5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      text: '#111827',
      textSecondary: '#6b7280'
    },
    gradients: {
      background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
      surface: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
      primary: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      secondary: 'linear-gradient(135deg, #a5b4fc, #818cf8)',
      card: 'linear-gradient(145deg, #ffffff, #f3f4f6)'
    },
    shadows: {
      soft: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      hard: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      glow: '0 0 15px rgba(99, 102, 241, 0.4)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
    },
    glass: {
      default: 'rgba(255, 255, 255, 0.8)',
      heavy: 'rgba(255, 255, 255, 0.95)',
      card: 'rgba(255, 255, 255, 0.6)'
    },
    borders: {
      radius: '16px',
      width: '1px',
      color: '#e5e7eb'
    },
    ...defaultLayout
  }
}

export default temas
