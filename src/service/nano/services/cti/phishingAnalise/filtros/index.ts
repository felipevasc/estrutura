import { FiltroPhishing } from "../tipos";
import filtroConteudoVazio from "./filtroConteudoVazio";
import filtroInteracaoLimitada from "./filtroInteracaoLimitada";
import filtroCredenciais from "./filtroCredenciais";
import filtroFinanceiro from "./filtroFinanceiro";
import filtroIdentidade from "./filtroIdentidade";
import filtroRedirecionamento from "./filtroRedirecionamento";

const filtros: FiltroPhishing[] = [
    filtroConteudoVazio,
    filtroInteracaoLimitada,
    filtroCredenciais,
    filtroFinanceiro,
    filtroIdentidade,
    filtroRedirecionamento
];

export default filtros;
