import { ContainerRelatorio } from "./styles";
import { PainelControle } from "./components/PainelControle";
import { Visualizacao } from "./components/Visualizacao";
import { useRelatorio } from "./hooks/useRelatorio";

export default function Relatorios() {
    const {
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
    } = useRelatorio();

    return (
        <ContainerRelatorio>
            <PainelControle
                relatorios={relatoriosDisponiveis}
                relatorioSelecionado={relatorioSelecionado}
                setRelatorioSelecionado={setRelatorioSelecionado}
                filtroTipo={filtroTipo}
                setFiltroTipo={setFiltroTipo}
                agrupamentoTemporal={agrupamentoTemporal}
                setAgrupamentoTemporal={setAgrupamentoTemporal}
                limiteTop={limiteTop}
                setLimiteTop={setLimiteTop}
                ordenacao={ordenacao}
                setOrdenacao={setOrdenacao}
                intervaloDatas={intervaloDatas}
                setIntervaloDatas={setIntervaloDatas}
                relatorioAtual={relatorioAtual}
            />
            <Visualizacao
                relatorio={relatorioAtual}
                resultado={resultado}
            />
        </ContainerRelatorio>
    );
}
