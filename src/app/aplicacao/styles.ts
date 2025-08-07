'use client'
import styled, { createGlobalStyle } from "styled-components";

export const StyledEstruturaInicial = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100vh;
    max-height: 100vh;
    padding: 0;
    margin: 0;
    overflow: hidden;
    width: 100%;
    gap: 0;
`

export const StyledEstruturaCentro = styled.div`
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
    width: 100%;
    gap: 1rem;
    padding: 1rem;
    height: calc(100% - 1100px);
    overflow-y: auto;
`

export const StyledConteudoPrincipal = styled.main`
    flex-grow: 1;
    padding: 1rem;
    overflow-y: auto;
    background-color: var(--panel-background);
    border: 1px solid var(--border-color);
`

export const StyledPainelDireito = styled.aside`
    width: 250px;
    flex-shrink: 0;
    padding: 1rem;
    overflow-y: auto;
    background-color: var(--panel-background);
    border: 1px solid var(--border-color);
`

export const StyledPainelEsquerdo = styled.aside`
    width: 250px;
    flex-shrink: 0;
    padding: 1rem;
    overflow-y: auto;
    background-color: var(--panel-background);
    border: 1px solid var(--border-color);
`

const generateGlitchKeyframes = () => {
  const steps = 20;
  let keyframes = `@keyframes glitch {\n`; // Inicia a string dos keyframes

  for (let i = 0; i <= steps; i++) {
    const percentage = (i / steps) * 100;
    const randomClip = Math.floor(Math.random() * 100); // random(100)
    keyframes += `  ${percentage}% {\n`;
    keyframes += `    clip: rect(${randomClip}px, 9999px, ${randomClip}px, 0);\n`;
    keyframes += `  }\n`;
  }

  keyframes += `}`; // Fecha a string
  return keyframes;
};

const generateFaithfulGlitchKeyframes = () => {
  const steps = 20;
  let keyframes = `@keyframes faithful-glitch-anim {\n`;

  for (let i = 0; i <= steps; i++) {
    const percentage = (i / steps) * 100;
    // Geramos dois valores aleatórios para o topo e a base do corte
    const randomTop = Math.floor(Math.random() * 100);
    const randomBottom = Math.floor(Math.random() * 100);
    keyframes += `  ${percentage}% {\n`;
    keyframes += `    clip: rect(${randomTop}px, 9999px, ${randomBottom}px, 0);\n`;
    keyframes += `  }\n`;
  }

  keyframes += `}`;
  return keyframes;
};

export const GlobalStyle2 = createGlobalStyle`
  /* --- Gera e injeta os keyframes do glitch fiel --- */
  ${generateFaithfulGlitchKeyframes()}

  ${generateGlitchKeyframes()}
  /*
   * --- NOVA CLASSE PARA O EFEITO FIEL ---
   * Esta classe controla toda a sequência de animação.
  */
  .faithful-glitch {
    position: relative;
    color: var(--panel-background);
    animation: fade-in 1.7s forwards;
    animation-delay: 1.1s; 
  }

  /* 3. Os pseudo-elementos criam o glitch */
  .faithful-glitch::before,
  .faithful-glitch::after {
    content: attr(data-text); 
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--panel-background);
    color: var(--text-color);
    overflow: hidden;
    
    /* 4. A animação de glitch só começa depois de 4 segundos */
    animation: faithful-glitch-anim 1.2s infinite alternate-reverse;
    animation-delay: 0.7s;
  }

  /* 5. Pequenos deslocamentos para o efeito de distorção */
  .faithful-glitch::before {
    left: 2px;
    text-shadow: -1px 0 #ff00c1;
  }

  .faithful-glitch::after {
    left: -2px;
    text-shadow: -1px 0 #00fff9;
  }

  /* Keyframes para a animação de revelação do texto */
  @keyframes fade-in {
    to {
      color: var(--text-color);
    }
  }
`;

export const GlobalStyle = createGlobalStyle`
  /*
    Define a classe que VAI ACIONAR o efeito.
    A animação dura 0.4 segundos e roda apenas uma vez.
  */
  .is-glitching {
    animation: glitch-shake 1s 1 linear;
  }

  /* Os keyframes definem a aparência do tremor.
  */
  @keyframes glitch-shake {
    0% {
      transform: translate(0, 0);
    }
    15% {
      transform: translate(-2px, 3px);
    }
    30% {
      transform: translate(3px, -1px);
    }
    45% {
      transform: translate(-1px, 4px);
    }
    60% {
      transform: translate(4px, -2px);
    }
    75% {
      transform: translate(-2px, 1px);
    }
    90% {
      transform: translate(1px, -3px);
    }
    100% {
      transform: translate(0, 0);
    }
  }
`;