import { TemaType } from "@/types/TemaType";

type Tema = {
    colors: {
        background: string;
        foreground: string;
        borderColor: string;
        panelBackground: string;
        accentColor: string;
        hoverBackground: string;
    };
};

const classico: Tema = {
    colors: {
        background: "#C0C0C0",
        foreground: "#000000",
        borderColor: "#808080",
        panelBackground: "#B0B0B0",
        accentColor: "#000080",
        hoverBackground: "#FFFFFF"
    }
};

const hacker: Tema = {
    colors: {
        background: "#000000",
        foreground: "#00FF00",
        borderColor: "#003300",
        panelBackground: "#001900",
        accentColor: "#00FF00",
        hoverBackground: "#003300"
    }
};

const fofinho: Tema = {
    colors: {
        background: "#FFE4F2",
        foreground: "#333333",
        borderColor: "#FFB6C1",
        panelBackground: "#FFD1DC",
        accentColor: "#FF69B4",
        hoverBackground: "#FFB6C1"
    }
};

const elegante: Tema = {
    colors: {
        background: "#F5F5F0",
        foreground: "#333333",
        borderColor: "#CCCCCC",
        panelBackground: "#FFFFFF",
        accentColor: "#A3C1AD",
        hoverBackground: "#E6E6E0"
    }
};

const dark: Tema = {
    colors: {
        background: "#0A0A0A",
        foreground: "#E0E0E0",
        borderColor: "#333333",
        panelBackground: "#121212",
        accentColor: "#FFD700",
        hoverBackground: "#1A1A1A"
    }
};

const clean: Tema = {
    colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        borderColor: "#DDDDDD",
        panelBackground: "#F7F7F7",
        accentColor: "#007ACC",
        hoverBackground: "#EEEEEE"
    }
};

const temas: Record<TemaType, Tema> = {
    classico,
    hacker,
    fofinho,
    elegante,
    dark,
    clean
};

export default temas;
