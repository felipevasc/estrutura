import { ContainerRelatorio } from "./styles";
import { PainelControle } from "./components/PainelControle";
import { Visualizacao } from "./components/Visualizacao";
import { useRelatorio } from "./hooks/useRelatorio";

export default function Relatorios() {
    const {
        groupBy,
        setGroupBy,
        filterType,
        setFilterType,
        chartData,
        tableData
    } = useRelatorio();

    return (
        <ContainerRelatorio>
            <PainelControle
                groupBy={groupBy}
                setGroupBy={setGroupBy}
                filterType={filterType}
                setFilterType={setFilterType}
            />
            <Visualizacao
                chartData={chartData}
                tableData={tableData}
                groupBy={groupBy as string}
            />
        </ContainerRelatorio>
    );
}
