import { useMemo } from "react";
import useChat from "./chat";
import useDominios from "./dominios";
import useFerramentas from "./ferramentas";
import useIps from "./ips";
import useProjetos from "./projetos";
import useQueue from "./queue";
import useUsuarios from "./usuarios";
import useConfiguracoes from "./configuracoes";
import useDiretorios from "./diretorios";

const useApi = () => {
    const chat = useChat();
    const dominios = useDominios();
    const projetos = useProjetos();
    const ferramentas = useFerramentas();
    const ips = useIps();
    const diretorios = useDiretorios();
    const queue = useQueue();
    const usuarios = useUsuarios();
    const configuracoes = useConfiguracoes();

    return useMemo(() => ({
        chat,
        projeto: projetos,
        dominios,
        ferramentas,
        ips,
        diretorios,
        queue,
        usuarios,
        configuracoes,
    }), [chat, projetos, dominios, ferramentas, ips, diretorios, queue, usuarios, configuracoes]);
}

export default useApi;
