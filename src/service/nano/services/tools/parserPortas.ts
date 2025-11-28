import { TipoPorta } from '@/database/functions/ip';

export const extrairPortasGrep = (conteudo: string) => {
  const portas: TipoPorta[] = [];
  const linhas = conteudo.split('\n');

  for (const linha of linhas) {
    if (linha.startsWith('#') || !linha.includes('Ports:')) continue;

    const partes = linha.split('Ports:');
    if (partes.length < 2) continue;

    const dadosPortas = partes[1].trim();
    const entradas = dadosPortas.split(', ');

    for (const entrada of entradas) {
      const campos = entrada.split('/');
      if (campos.length < 3) continue;

      const numero = parseInt(campos[0], 10);
      const estado = campos[1];
      const protocolo = campos[2];
      const servico = campos[4] || '';
      const versao = campos[5] || '';

      if (estado === 'open' && !isNaN(numero)) {
        portas.push({
          porta: numero,
          servico,
          versao,
          protocolo,
        });
      }
    }
  }

  return portas;
};
