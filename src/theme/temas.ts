import { LayoutType } from '@/types/LayoutType';

type Cores = {
    background: string;
    foreground: string;
    borderColor: string;
    panelBackground: string;
    accentColor: string;
    hoverBackground: string;
};

type Tema = {
    colors: Cores;
};

const temas: Record<LayoutType, Tema> = {
    classico: {
        colors: {
            background: '#c0c0c0',
            foreground: '#000000',
            borderColor: '#ffffff',
            panelBackground: '#d4d0c8',
            accentColor: '#000080',
            hoverBackground: '#808080'
        }
    },
    hacker: {
        colors: {
            background: '#000000',
            foreground: '#00ff00',
            borderColor: '#003300',
            panelBackground: '#001100',
            accentColor: '#00ff00',
            hoverBackground: '#003300'
        }
    },
    fofinho: {
        colors: {
            background: '#ffe4f5',
            foreground: '#ff69b4',
            borderColor: '#ffc0cb',
            panelBackground: '#fff0f8',
            accentColor: '#ff1493',
            hoverBackground: '#ffd1dc'
        }
    },
    elegante: {
        colors: {
            background: '#faf8f5',
            foreground: '#4b4b4b',
            borderColor: '#e0dcd5',
            panelBackground: '#ffffff',
            accentColor: '#c4a69f',
            hoverBackground: '#e8e2da'
        }
    },
    dark: {
        colors: {
            background: '#000000',
            foreground: '#f0f0f0',
            borderColor: '#333333',
            panelBackground: '#1a1a1a',
            accentColor: '#ffbe00',
            hoverBackground: '#222222'
        }
    },
    clean: {
        colors: {
            background: '#ffffff',
            foreground: '#333333',
            borderColor: '#dddddd',
            panelBackground: '#f7f7f7',
            accentColor: '#4a90e2',
            hoverBackground: '#eaeaea'
        }
    }
};

export default temas;
