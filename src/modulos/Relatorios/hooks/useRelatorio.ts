import { useQuery } from "@tanstack/react-query";
import { ItemRelatorio } from "@/types/Relatorio";
import StoreContext from "@/store";
import { useContext, useState, useMemo } from "react";

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

    const [groupBy, setGroupBy] = useState<keyof ItemRelatorio>('tipo');
    const [filterType, setFilterType] = useState<string>('todos');

    const chartData = useMemo(() => {
        let filtered = items;

        if (filterType !== 'todos') {
            filtered = items.filter(i => i.tipo === filterType);
        }

        const groups: Record<string, number> = {};

        filtered.forEach(item => {
            const val = item[groupBy];
            const key = (val !== null && val !== undefined) ? String(val) : 'N/A';
            groups[key] = (groups[key] || 0) + 1;
        });

        return Object.entries(groups)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [items, groupBy, filterType]);

    // Dados para tabela (filtrados)
    const tableData = useMemo(() => {
        if (filterType === 'todos') return items;
        return items.filter(i => i.tipo === filterType);
    }, [items, filterType]);

    return {
        items,
        isLoading,
        error,
        groupBy,
        setGroupBy,
        filterType,
        setFilterType,
        chartData,
        tableData
    };
}
