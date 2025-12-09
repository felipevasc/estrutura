import { useCallback, useState } from "react";
import { NoCarregavel } from "./tipos";

const TAMANHO_PAGINA = 20;
const TIPOS_PAGINADOS = ["dominio", "ip", "diretorio", "porta"];

export type RetornoPaginacaoArvore = {
  aplicar: (lista: NoCarregavel[], chave?: string) => NoCarregavel[];
  resetar: () => void;
};

const usePaginacaoArvore = (): RetornoPaginacaoArvore => {
  const [limites, setLimites] = useState<Record<string, number>>({});

  const carregarMais = useCallback((chave: string) => {
    setLimites(atual => ({ ...atual, [chave]: (atual[chave] ?? TAMANHO_PAGINA) + TAMANHO_PAGINA }));
  }, []);

  const criarBotao = useCallback((chave: string, limite: number): NoCarregavel => ({
    key: `${chave}-mais-${limite}`,
    title: <div style={{ cursor: "pointer" }} onClick={evento => {
      evento.stopPropagation();
      carregarMais(chave);
    }}>(...)</div>,
    isLeaf: true,
    selectable: false
  }), [carregarMais]);

  const tipoDoNo = useCallback((no: NoCarregavel) => TIPOS_PAGINADOS.find(tipo => no.className?.includes(tipo)), []);

  const paginarLista = useCallback((lista: NoCarregavel[], chave: string) => {
    const alvos = lista.filter(no => tipoDoNo(no));
    if (alvos.length === 0) return lista;
    const tipo = tipoDoNo(alvos[0]);
    if (!tipo || alvos.some(no => tipoDoNo(no) !== tipo)) return lista;
    const limite = limites[chave] ?? TAMANHO_PAGINA;
    if (alvos.length <= limite) return lista;
    const visiveis = alvos.slice(0, limite);
    const resultado: NoCarregavel[] = [];
    let inserido = false;
    lista.forEach(no => {
      if (tipoDoNo(no)) {
        if (!inserido) {
          resultado.push(...visiveis, criarBotao(chave, limite));
          inserido = true;
        }
      } else {
        resultado.push(no);
      }
    });
    return resultado;
  }, [criarBotao, limites, tipoDoNo]);

  const prepararNo = useCallback((no: NoCarregavel): NoCarregavel => {
    const filhos = no.children?.map(filho => prepararNo(filho));
    if (!filhos) return no;
    const chave = `${no.key}-filhos`;
    const filhosPaginados = filhos.length ? paginarLista(filhos, chave) : filhos;
    return { ...no, children: filhosPaginados };
  }, [paginarLista]);

  const aplicar = useCallback((lista: NoCarregavel[], chave?: string) => {
    const processados = lista.map(item => prepararNo(item));
    return chave ? paginarLista(processados, chave) : processados;
  }, [paginarLista, prepararNo]);

  const resetar = useCallback(() => setLimites({}), []);

  return { aplicar, resetar };
};

export default usePaginacaoArvore;
