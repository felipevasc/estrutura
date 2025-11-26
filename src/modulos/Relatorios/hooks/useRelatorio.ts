import { useQuery } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import { ConfiguracaoRelatorio, DadoGraficoRelatorio, ItemRelatorio, ResultadoRelatorio } from "@/types/Relatorio";
import StoreContext from "@/store";
import { useContext, useState, useMemo, useCallback } from "react";

export function useRelatorio() {
    const { projeto } = useContext(StoreContext);
    const projectId = projeto?.get()?.id;

    const { data: items = [], isLoading, error } = useQuery({
        queryKey: ['relatorio', projectId],
        queryFn: async () => {
            if (!projectId) return [];
            const res = await fetch(`/api/v1/projetos/${projectId}/relatorio`);
            if (!res.ok) throw new Error("Falha ao carregar relatório");
            return res.json() as Promise<ItemRelatorio[]>;
        },
        enabled: !!projectId
    });

    const [relatorioSelecionado, setRelatorioSelecionado] = useState<string>('resumo_tipo');
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');
    const [agrupamentoTemporal, setAgrupamentoTemporal] = useState<'mes' | 'semana' | 'dia'>('mes');
    const [limiteTop, setLimiteTop] = useState<number>(8);
    const [ordenacao, setOrdenacao] = useState<'asc' | 'desc'>('desc');
    const [intervaloDatas, setIntervaloDatas] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

    const normalizarValor = (valor: string | number | null | undefined) => {
        if (valor === null || valor === undefined) return 'N/A';
        if (valor === '') return 'N/A';
        return String(valor);
    };

    const ordenarDados = useCallback((dados: DadoGraficoRelatorio[], limitar: boolean) => {
        const base = [...dados];
        base.sort((a, b) => ordenacao === 'asc' ? a.valor - b.valor : b.valor - a.valor);
        if (limitar) return base.slice(0, limiteTop);
        return base;
    }, [limiteTop, ordenacao]);

    const registrosFiltrados = useMemo(() => {
        return items.filter(item => {
            if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false;
            if (intervaloDatas[0] || intervaloDatas[1]) {
                if (!item.criadoEm) return false;
                const data = dayjs(item.criadoEm);
                if (!data.isValid()) return false;
                if (intervaloDatas[0] && data.isBefore(intervaloDatas[0], 'day')) return false;
                if (intervaloDatas[1] && data.isAfter(intervaloDatas[1], 'day')) return false;
            }
            return true;
        });
    }, [items, filtroTipo, intervaloDatas]);

    const tabelaOrdenada = useMemo(() => {
        return [...registrosFiltrados].sort((a, b) => {
            if (a.criadoEm && b.criadoEm) return dayjs(b.criadoEm).valueOf() - dayjs(a.criadoEm).valueOf();
            return 0;
        });
    }, [registrosFiltrados]);

    const agrupar = useCallback((dados: ItemRelatorio[], campo: keyof ItemRelatorio, limitar = true) => {
        const grupos: Record<string, number> = {};
        dados.forEach(item => {
            const chave = normalizarValor(item[campo] as string | number | null | undefined);
            grupos[chave] = (grupos[chave] || 0) + 1;
        });
        return ordenarDados(Object.entries(grupos).map(([nome, valor]) => ({ nome, valor })), limitar);
    }, [ordenarDados]);

    const relatoriosDisponiveis: ConfiguracaoRelatorio[] = useMemo(() => ([
        { chave: 'resumo_tipo', titulo: 'Distribuição por tipo', descricao: 'Comparativo geral das categorias coletadas', tipoGrafico: 'barra' },
        { chave: 'linha_tempo', titulo: 'Evolução temporal', descricao: 'Volumes distribuídos no tempo', tipoGrafico: 'linha' },
        { chave: 'dominios', titulo: 'Domínios em destaque', descricao: 'Contexto por domínio', tipoGrafico: 'barra' },
        { chave: 'ips', titulo: 'IPs em destaque', descricao: 'Contexto por IP', tipoGrafico: 'barra' },
        { chave: 'status', titulo: 'Status HTTP', descricao: 'Distribuição de respostas', tipoGrafico: 'barra' },
        { chave: 'portas', titulo: 'Portas e exposição', descricao: 'Portas mapeadas por volume', tipoGrafico: 'barra' },
        { chave: 'servicos', titulo: 'Serviços detectados', descricao: 'Tecnologias e banners coletados', tipoGrafico: 'barra' },
        { chave: 'protocolos', titulo: 'Protocolos', descricao: 'Protocolos predominantes', tipoGrafico: 'pizza' },
        { chave: 'tamanho_medio', titulo: 'Tamanho médio', descricao: 'Média de tamanho por tipo', tipoGrafico: 'area' },
        { chave: 'cobertura', titulo: 'Cobertura de contexto', descricao: 'Presença de domínios, IPs e serviços', tipoGrafico: 'pizza' },
        { chave: 'densidade_portas', titulo: 'Densidade de portas por IP', descricao: 'Quantidade média de portas por IP', tipoGrafico: 'barra' },
        { chave: 'diversidade_valor', titulo: 'Diversidade por tipo', descricao: 'Valores únicos por categoria', tipoGrafico: 'barra' },
    ]), []);

    const relatorioAtual = useMemo(() => {
        return relatoriosDisponiveis.find(r => r.chave === relatorioSelecionado) || relatoriosDisponiveis[0];
    }, [relatorioSelecionado, relatoriosDisponiveis]);

    const gerarLinhaDoTempo = useCallback((dados: ItemRelatorio[]) => {
        const formato = agrupamentoTemporal === 'mes' ? 'YYYY-MM' : agrupamentoTemporal === 'semana' ? 'YYYY-[S]WW' : 'YYYY-MM-DD';
        const grupos: Record<string, number> = {};
        dados.forEach(item => {
            if (!item.criadoEm) return;
            const data = dayjs(item.criadoEm);
            if (!data.isValid()) return;
            const chave = data.format(formato);
            grupos[chave] = (grupos[chave] || 0) + 1;
        });
        const lista = Object.entries(grupos).map(([nome, valor]) => ({ nome, valor }));
        lista.sort((a, b) => dayjs(a.nome, formato).valueOf() - dayjs(b.nome, formato).valueOf());
        return lista;
    }, [agrupamentoTemporal]);

    const gerarTamanhoMedio = useCallback((dados: ItemRelatorio[]) => {
        const grupos: Record<string, { total: number; quantidade: number }> = {};
        dados.forEach(item => {
            if (item.tamanho === null || item.tamanho === undefined) return;
            const chave = normalizarValor(item.tipo);
            if (!grupos[chave]) grupos[chave] = { total: 0, quantidade: 0 };
            grupos[chave].total += item.tamanho;
            grupos[chave].quantidade += 1;
        });
        const lista = Object.entries(grupos).map(([nome, dados]) => ({ nome, valor: Number((dados.total / dados.quantidade).toFixed(2)) }));
        return ordenarDados(lista, true);
    }, [ordenarDados]);

    const gerarCobertura = useCallback((dados: ItemRelatorio[]) => {
        const lista: DadoGraficoRelatorio[] = [
            { nome: 'Com domínio', valor: dados.filter(d => !!d.dominio).length },
            { nome: 'Com IP', valor: dados.filter(d => !!d.ip).length },
            { nome: 'Com porta', valor: dados.filter(d => d.porta !== null && d.porta !== undefined).length },
            { nome: 'Com serviço', valor: dados.filter(d => !!d.servico).length }
        ];
        return ordenarDados(lista, false);
    }, [ordenarDados]);

    const gerarDensidadePortas = useCallback((dados: ItemRelatorio[]) => {
        const mapa = new Map<string, Set<number>>();
        dados.forEach(item => {
            if (!item.ip) return;
            if (item.porta === null || item.porta === undefined) return;
            if (!mapa.has(item.ip)) mapa.set(item.ip, new Set());
            mapa.get(item.ip)?.add(item.porta);
        });
        const lista = Array.from(mapa.entries()).map(([nome, portas]) => ({ nome, valor: portas.size }));
        return ordenarDados(lista, true);
    }, [ordenarDados]);

    const gerarDiversidadeValor = useCallback((dados: ItemRelatorio[]) => {
        const mapa = new Map<string, Set<string>>();
        dados.forEach(item => {
            const chave = normalizarValor(item.tipo);
            if (!mapa.has(chave)) mapa.set(chave, new Set());
            mapa.get(chave)?.add(item.valor);
        });
        const lista = Array.from(mapa.entries()).map(([nome, valores]) => ({ nome, valor: valores.size }));
        return ordenarDados(lista, false);
    }, [ordenarDados]);

    const geradores = useMemo<Record<string, () => ResultadoRelatorio>>(() => ({
        resumo_tipo: () => ({ dadosGrafico: agrupar(registrosFiltrados, 'tipo'), dadosTabela: tabelaOrdenada, tipoGrafico: 'barra', eixoX: 'Categorias', eixoY: 'Quantidade' }),
        linha_tempo: () => ({ dadosGrafico: gerarLinhaDoTempo(registrosFiltrados), dadosTabela: tabelaOrdenada, tipoGrafico: 'linha', eixoX: 'Período', eixoY: 'Eventos' }),
        dominios: () => ({ dadosGrafico: agrupar(registrosFiltrados.filter(d => d.dominio), 'dominio'), dadosTabela: tabelaOrdenada, tipoGrafico: 'barra', eixoX: 'Domínio', eixoY: 'Ocorrências' }),
        ips: () => ({ dadosGrafico: agrupar(registrosFiltrados.filter(d => d.ip), 'ip'), dadosTabela: tabelaOrdenada, tipoGrafico: 'barra', eixoX: 'IP', eixoY: 'Ocorrências' }),
        status: () => ({ dadosGrafico: agrupar(registrosFiltrados.filter(d => d.status !== null && d.status !== undefined), 'status'), dadosTabela: tabelaOrdenada, tipoGrafico: 'barra', eixoX: 'Status', eixoY: 'Respostas' }),
        portas: () => ({ dadosGrafico: agrupar(registrosFiltrados.filter(d => d.porta !== null && d.porta !== undefined), 'porta'), dadosTabela: tabelaOrdenada, tipoGrafico: 'barra', eixoX: 'Porta', eixoY: 'Ocorrências' }),
        servicos: () => ({ dadosGrafico: agrupar(registrosFiltrados.filter(d => d.servico), 'servico'), dadosTabela: tabelaOrdenada, tipoGrafico: 'barra', eixoX: 'Serviço', eixoY: 'Ocorrências' }),
        protocolos: () => ({ dadosGrafico: agrupar(registrosFiltrados.filter(d => d.protocolo), 'protocolo', false), dadosTabela: tabelaOrdenada, tipoGrafico: 'pizza', eixoX: 'Protocolo', eixoY: 'Presença' }),
        tamanho_medio: () => ({ dadosGrafico: gerarTamanhoMedio(registrosFiltrados), dadosTabela: tabelaOrdenada, tipoGrafico: 'area', eixoX: 'Tipo', eixoY: 'Tamanho médio' }),
        cobertura: () => ({ dadosGrafico: gerarCobertura(registrosFiltrados), dadosTabela: tabelaOrdenada, tipoGrafico: 'pizza', eixoX: 'Cobertura', eixoY: 'Quantidade' }),
        densidade_portas: () => ({ dadosGrafico: gerarDensidadePortas(registrosFiltrados), dadosTabela: tabelaOrdenada, tipoGrafico: 'barra', eixoX: 'IP', eixoY: 'Portas únicas' }),
        diversidade_valor: () => ({ dadosGrafico: gerarDiversidadeValor(registrosFiltrados), dadosTabela: tabelaOrdenada, tipoGrafico: 'barra', eixoX: 'Tipo', eixoY: 'Valores únicos' })
    }), [agrupar, gerarCobertura, gerarDensidadePortas, gerarDiversidadeValor, gerarLinhaDoTempo, gerarTamanhoMedio, registrosFiltrados, tabelaOrdenada]);

    const resultado = useMemo<ResultadoRelatorio>(() => {
        const gerador = geradores[relatorioAtual.chave];
        if (!gerador) return { dadosGrafico: [], dadosTabela: tabelaOrdenada, tipoGrafico: relatorioAtual.tipoGrafico };
        const base = gerador();
        return { ...base, tipoGrafico: relatorioAtual.tipoGrafico };
    }, [relatorioAtual, geradores, tabelaOrdenada]);

    return {
        items,
        isLoading,
        error,
        relatoriosDisponiveis,
        relatorioAtual,
        relatorioSelecionado,
        setRelatorioSelecionado,
        filtroTipo,
        setFiltroTipo,
        agrupamentoTemporal,
        setAgrupamentoTemporal,
        limiteTop,
        setLimiteTop,
        ordenacao,
        setOrdenacao,
        intervaloDatas,
        setIntervaloDatas,
        resultado
    };
}
