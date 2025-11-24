import useDominios from "./dominios";
import useFerramentas from "./ferramentas";
import useIps from "./ips";
import useProjetos from "./projetos";
import useQueue from "./queue";
import useUsuarios from "./usuarios";
import useIa from "./ia";

const useApi = () => {
    const dominios = useDominios();
    const projetos = useProjetos();
    const ferramentas = useFerramentas();
    const ips = useIps();
    const queue = useQueue();
    const usuarios = useUsuarios();
    const ia = useIa();
    return {
        projeto: { ...projetos },
        dominios: { ...dominios },
        ferramentas: { ...ferramentas },
        ips: { ...ips },
        queue: { ...queue },
        usuarios: { ...usuarios },
        ia: { ...ia },
    }
}

export default useApi;