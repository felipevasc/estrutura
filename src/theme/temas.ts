import { TemaType } from '@/types/TemaType';

type Tema = {
  colors: {
    background: string;
    foreground: string;
    borderColor: string;
    panelBackground: string;
    accentColor: string;
    hoverBackground: string;
  };
  fonte: string;
};

const temas: Record<TemaType, Tema> = {
  classico: {
    colors: {
      background: '#C0C0C0',
      foreground: '#000000',
      borderColor: '#808080',
      panelBackground: '#FFFFFF',
      accentColor: '#000080',
      hoverBackground: '#B0B0B0',
    },
    fonte: 'Tahoma, sans-serif',
  },
  hacker: {
    colors: {
      background: '#000000',
      foreground: '#00FF00',
      borderColor: '#003300',
      panelBackground: '#001900',
      accentColor: '#00FF00',
      hoverBackground: '#003300',
    },
    fonte: 'Courier New, monospace',
  },
  fofo: {
    colors: {
      background: '#FFE4F0',
      foreground: '#FF69B4',
      borderColor: '#FFB6C1',
      panelBackground: '#FFFFFF',
      accentColor: '#FF1493',
      hoverBackground: '#FFD1DC',
    },
    fonte: 'Comic Sans MS, cursive',
  },
  elegante: {
    colors: {
      background: '#F5F5F0',
      foreground: '#333333',
      borderColor: '#D3D3C9',
      panelBackground: '#FFFFFF',
      accentColor: '#708090',
      hoverBackground: '#E6E6E0',
    },
    fonte: 'Georgia, serif',
  },
  sombrio: {
    colors: {
      background: '#0D1117',
      foreground: '#C9D1D9',
      borderColor: '#30363D',
      panelBackground: '#161B22',
      accentColor: '#58A6FF',
      hoverBackground: '#21262D',
    },
    fonte: 'Rawline, sans-serif',
  },
  clean: {
    colors: {
      background: '#FFFFFF',
      foreground: '#000000',
      borderColor: '#E0E0E0',
      panelBackground: '#FAFAFA',
      accentColor: '#3B82F6',
      hoverBackground: '#F0F0F0',
    },
    fonte: 'Arial, sans-serif',
  },
};

export default temas;
export type { Tema };
