import prisma from "..";

export async function adicionarSubdominio(subdominios: string[], projetoId: number) {
  // 1. Uniquify input and remove empty strings
  const uniqueSubs = [...new Set(subdominios)].filter(s => s && s.trim().length > 0);
  if (uniqueSubs.length === 0) return;

  // 2. Fetch existing domains for the project
  const dominiosExistentes = await prisma.dominio.findMany({
    where: {
      projetoId: projetoId,
    }
  });

  // 3. Maintain a local cache of all domains (DB + newly created)
  //    We store them in a way that lets us search for parents easily.
  const todosDominios = [...dominiosExistentes];

  // 4. Sort new subdomains by length (shortest first).
  //    This increases the chance that a parent is created before its child
  //    (e.g. "test.com" created before "api.test.com").
  uniqueSubs.sort((a, b) => a.length - b.length);

  for (const s of uniqueSubs) {
    // Check if already exists (case insensitive check usually good, but let's stick to exact for now)
    if (todosDominios.some(d => d.endereco === s)) {
      continue;
    }

    // Find best parent: Longest existing domain that is a proper suffix of 's'
    let melhorPai = null;
    let maxLen = -1;

    for (const candidato of todosDominios) {
      // Check if 'candidato' is a parent of 's'
      // e.g. s="api.test.com", candidato="test.com" -> endsWith(".test.com") -> true
      if (s.endsWith("." + candidato.endereco)) {
        if (candidato.endereco.length > maxLen) {
          maxLen = candidato.endereco.length;
          melhorPai = candidato;
        }
      }
    }

    try {
      const novoDominio = await prisma.dominio.create({
        data: {
          endereco: s,
          projetoId: projetoId,
          paiId: melhorPai?.id ?? null,
        }
      });
      todosDominios.push(novoDominio);
    } catch (e) {
      console.error(`Erro ao criar domínio ${s}:`, e);
    }
  }
}
