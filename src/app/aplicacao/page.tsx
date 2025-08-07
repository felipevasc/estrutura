"use client"
import {
  StyledEstruturaCentro,
  StyledEstruturaInicial,
  StyledConteudoPrincipal,
  StyledPainelDireito,
  StyledPainelEsquerdo,
  GlobalStyle,
  GlobalStyle2,
} from "./styles";
import Topo from "@/layout/Topo";
import MenuEsquerdo from "@/layout/MenuEsquerdo";
import Rodape from "@/layout/Rodape";
import Explorer from "@/components/Explorer";
import Visualizador from "@/components/Visualizador";
import Ferramentas from "@/components/Ferramentas";
import { useEffect } from "react";

export default function Aplicacao() {
  useEffect(() => {
    const glitchTargets = document.querySelectorAll("div");

    if (glitchTargets.length === 0) {
      return;
    }

    const glitchInterval = 2500; 

    const triggerRandomGlitch = () => {
      const randomIndex = Math.floor(Math.random() * glitchTargets.length);
      const randomElement = glitchTargets[randomIndex];
      
      if (!randomElement.classList.contains('is-glitching')) {
        randomElement.classList.add("is-glitching");
      }

      setTimeout(() => {
        randomElement.classList.remove("is-glitching");
      }, 400);
    };

    const intervalId = setInterval(triggerRandomGlitch, glitchInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
    <GlobalStyle /> 
    <StyledEstruturaInicial>
      <Topo />
      <StyledEstruturaCentro>
        <StyledPainelEsquerdo>
          <Explorer />
        </StyledPainelEsquerdo>
        <StyledConteudoPrincipal>
          <Visualizador />
        </StyledConteudoPrincipal>
        <StyledPainelDireito>
          <Ferramentas />
        </StyledPainelDireito>
      </StyledEstruturaCentro>
      <Rodape />
    </StyledEstruturaInicial>
    </>
  );
}
