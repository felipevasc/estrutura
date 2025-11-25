import useChat from "./chat";
import useDominios from "./dominios";
import useFerramentas from "./ferramentas";
import useIps from "./ips";
import useProjetos from "./projetos";
import useQueue from "./queue";
import useUsuarios from "./usuarios";
import useConfiguracoes from "./configuracoes";

const useApi = () => {
    const chat = useChat();
    const dominios = useDominios();
    const projetos = useProjetos();
    const ferramentas = useFerramentas();
    const ips = useIps();
    const queue = useQueue();
    const usuarios = useUsuarios();
    const configuracoes = useConfiguracoes();
    return {
        chat: { ...chat },
        projeto: { ...projetos },
        dominios: { ...dominios },
        ferramentas: { ...ferramentas },
        ips: { ...ips },
        queue: { ...queue },
        usuarios: { ...usuarios },
        configuracoes: { ...configuracoes },
    }
}

export default useApi;