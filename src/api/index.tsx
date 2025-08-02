import useDominios from "./dominios";
import useProjetos from "./projetos";

const useApi = () => {
    const dominios = useDominios();
    const projetos = useProjetos();
    return {
        projeto: { ...projetos },
        dominios: { ...dominios }
    }
}

export default useApi;