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
import useDns from "./dns";
import usePortas from "./portas";
import useRecon from "./recon";
import useSentinela from "./sentinela";

const useApi = () => {
    const chat = useChat();
    const dominios = useDominios();
    const dns = useDns();
    const projetos = useProjetos();
    const ferramentas = useFerramentas();
    const ips = useIps();
    const diretorios = useDiretorios();
    const portas = usePortas();
    const recon = useRecon();
    const queue = useQueue();
    const usuarios = useUsuarios();
    const configuracoes = useConfiguracoes();
    const sentinela = useSentinela();

    return useMemo(() => ({
        chat,
        projeto: projetos,
        dominios,
        dns,
        ferramentas,
        ips,
        diretorios,
        portas,
        recon,
        queue,
        usuarios,
        configuracoes,
        sentinela,
    }), [chat, projetos, dominios, dns, ferramentas, ips, diretorios, portas, recon, queue, usuarios, configuracoes, sentinela]);
}

export default useApi;
