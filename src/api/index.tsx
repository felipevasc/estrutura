import useDominios from "./dominios";
import useFerramentas from "./ferramentas";
import useIps from "./ips";
import useProjetos from "./projetos";

const useApi = () => {
    const dominios = useDominios();
    const projetos = useProjetos();
    const ferramentas = useFerramentas();
    const ips = useIps();
    return {
        projeto: { ...projetos },
        dominios: { ...dominios },
        ferramentas: { ...ferramentas },
        ips: { ...ips },
    }
}

export default useApi;