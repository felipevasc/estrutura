import useDominios from "./dominios";
import useFerramentas from "./ferramentas";
import useIps from "./ips";
import useProjetos from "./projetos";
import useQueue from "./queue";

const useApi = () => {
    const dominios = useDominios();
    const projetos = useProjetos();
    const ferramentas = useFerramentas();
    const ips = useIps();
    const queue = useQueue();
    return {
        projeto: { ...projetos },
        dominios: { ...dominios },
        ferramentas: { ...ferramentas },
        ips: { ...ips },
        queue: { ...queue },
    }
}

export default useApi;