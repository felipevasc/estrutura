import { RetornoFiltro, ResultadoFiltro } from './tipos';

const termos = [
    'cartao de credito',
    'cartão de credito',
    'numero do cartao',
    'número do cartão',
    'cvv',
    'cvc',
    'iban',
    'pix',
    'boleto',
    'pagamento imediato',
    'payment details'
];

const filtroDadosFinanceiros = (html: string): RetornoFiltro => {
    const base = (html || '').toLowerCase();
    const termo = termos.find((entrada) => base.includes(entrada));
    if (termo) return { resultado: ResultadoFiltro.Possivel, detalhe: 'dados_financeiros' };
    return { resultado: ResultadoFiltro.Prosseguir };
};

export default filtroDadosFinanceiros;
