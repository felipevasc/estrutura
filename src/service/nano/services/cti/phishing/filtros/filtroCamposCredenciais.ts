import { RetornoFiltro, ResultadoFiltro } from './tipos';

const padroes = [
    /type=['"]password['"]/,
    /name=['"]senha['"]/,
    /name=['"]password['"]/,
    /senha\b/,
    /passcode/,
    /pin\b/,
    /otp\b/
];

const filtroCamposCredenciais = (html: string): RetornoFiltro => {
    const base = (html || '').toLowerCase();
    const encontrado = padroes.find((padrao) => padrao.test(base));
    if (encontrado) return { resultado: ResultadoFiltro.Possivel, detalhe: 'captura_credenciais' };
    return { resultado: ResultadoFiltro.Prosseguir };
};

export default filtroCamposCredenciais;
