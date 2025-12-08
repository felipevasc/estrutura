export type ResultadoGobuster = {
  caminho: string;
  status: number | null;
  tamanho: number | null;
};

export const extrairResultadosGobuster = (conteudo: string, base: string) => {
  const resultados: ResultadoGobuster[] = [];
  const baseNormalizada = base.endsWith("/") ? base.slice(0, -1) : base;

  for (const linha of conteudo.split("\n")) {
    const texto = linha.trim();
    if (!texto) continue;

    const semPrefixo = texto.startsWith("Found: ") ? texto.slice(7).trim() : texto;
    const regex = /^(\S+?)\s*\(Status:\s*(\d+)\)\s*\[Size:\s*(\d+)\]/;
    const encontrado = semPrefixo.match(regex);
    if (!encontrado) continue;

    let caminho = encontrado[1] ?? "";
    const status = parseInt(encontrado[2] ?? "", 10);
    const tamanho = parseInt(encontrado[3] ?? "", 10);

    if (baseNormalizada && caminho.startsWith(baseNormalizada)) caminho = caminho.slice(baseNormalizada.length);
    if (!caminho.startsWith("/")) caminho = `/${caminho}`;

    resultados.push({
      caminho,
      status: Number.isNaN(status) ? null : status,
      tamanho: Number.isNaN(tamanho) ? null : tamanho,
    });
  }

  return resultados;
};
