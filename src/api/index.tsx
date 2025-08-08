import useDominios from "./dominios";
import useFerramentas from "./ferramentas";
import useIps from "./ips";
import usePortas from "./portas";
import useProjetos from "./projetos";
import useQueue from "./queue";

const useApi = () => {
    const dominios = useDominios();
    const projetos = useProjetos();
    const ferramentas = useFerramentas();
    const ips = useIps();
    const portas = usePortas();
    const queue = useQueue();
    return {
        projeto: { ...projetos },
        dominios: { ...dominios },
        ferramentas: { ...ferramentas },
        ips: { ...ips },
        portas: { ...portas },
        queue: { ...queue },
    }
}

export default useApi;