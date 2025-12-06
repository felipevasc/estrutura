import filtroCamposCredenciais from './filtroCamposCredenciais';
import filtroDadosFinanceiros from './filtroDadosFinanceiros';
import filtroEstruturaVazia from './filtroEstruturaVazia';
import filtroInteracaoUsuario from './filtroInteracaoUsuario';
import filtroOfuscacaoRedirecionamento from './filtroOfuscacaoRedirecionamento';
import filtroTermosAlerta from './filtroTermosAlerta';
import { AvaliacaoFiltro, FiltroPhishing, ResultadoFiltro } from './tipos';

const filtros: { nome: string; filtro: FiltroPhishing }[] = [
    { nome: 'estrutura_vazia', filtro: filtroEstruturaVazia },
    { nome: 'interacao_usuario', filtro: filtroInteracaoUsuario },
    { nome: 'campos_credenciais', filtro: filtroCamposCredenciais },
    { nome: 'termos_alerta', filtro: filtroTermosAlerta },
    { nome: 'dados_financeiros', filtro: filtroDadosFinanceiros },
    { nome: 'ofuscacao_redirecionamento', filtro: filtroOfuscacaoRedirecionamento }
];

export const avaliarPagina = (html: string): AvaliacaoFiltro => {
    for (const item of filtros) {
        const retorno = item.filtro(html || '');
        if (retorno.resultado !== ResultadoFiltro.Prosseguir) return { filtro: item.nome, ...retorno };
    }
    return { filtro: 'sem_correspondencia', resultado: ResultadoFiltro.Prosseguir };
};

export { ResultadoFiltro } from './tipos';
