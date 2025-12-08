import { DiretorioResponse } from "@/types/DiretorioResponse";

export type NodoDiretorio = { diretorio: DiretorioResponse; nome: string; filhos: NodoDiretorio[] };

const normalizarCaminho = (diretorio: DiretorioResponse): DiretorioResponse => {
  const base = diretorio.caminho.startsWith("/") ? diretorio.caminho : `/${diretorio.caminho}`;
  const limpo = base.replace(/\/+/g, "/");
  const caminho = diretorio.tipo === "diretorio" && !limpo.endsWith("/") ? `${limpo}/` : limpo;
  return { ...diretorio, caminho };
};

const extrairNome = (caminho: string) => {
  const base = caminho.endsWith("/") ? caminho.slice(0, -1) : caminho;
  const partes = base.split("/").filter(Boolean);
  return partes.pop() ?? "/";
};

const caminhoPai = (caminho: string) => {
  const base = caminho.endsWith("/") ? caminho.slice(0, -1) : caminho;
  const partes = base.split("/").filter(Boolean);
  if (partes.length <= 1) return null;
  return `/${partes.slice(0, -1).join("/")}/`;
};

const ordenar = (nodos: NodoDiretorio[]) => {
  nodos.sort((a, b) => a.nome.localeCompare(b.nome));
  nodos.forEach((nodo) => ordenar(nodo.filhos));
};

export const construirArvoreDiretorios = (diretorios: DiretorioResponse[]) => {
  const mapa = new Map<string, NodoDiretorio>();

  diretorios.forEach((diretorio) => {
    const normalizado = normalizarCaminho(diretorio);
    const nome = extrairNome(normalizado.caminho);
    mapa.set(normalizado.caminho, { diretorio: normalizado, nome, filhos: [] });
  });

  const raizes: NodoDiretorio[] = [];

  mapa.forEach((nodo, caminho) => {
    const pai = caminhoPai(caminho);
    if (pai && mapa.has(pai)) {
      mapa.get(pai)?.filhos.push(nodo);
    } else {
      raizes.push(nodo);
    }
  });

  ordenar(raizes);

  return raizes;
};
