import { CronExpressionParser } from 'cron-parser';

export const calcularProximaExecucao = (expressao: string) => {
    try {
        const cron = CronExpressionParser.parse(expressao.trim());
        return cron.next().toDate();
    } catch {
        return null;
    }
};
