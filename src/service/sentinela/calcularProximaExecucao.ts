import parser from 'cron-parser';

export const calcularProximaExecucao = (expressao: string) => {
    try {
        const iterador = parser.parseExpression(expressao.trim());
        return iterador.next().toDate();
    } catch {
        return null;
    }
};
