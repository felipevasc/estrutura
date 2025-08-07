import useDominios from "./dominios";
import useFerramentas from "./ferramentas";
import useProjetos from "./projetos";

const useApi = () => {
    const dominios = useDominios();
    const projetos = useProjetos();
    const ferramentas = useFerramentas();
    return {
        projeto: { ...projetos },
        dominios: { ...dominios },
        ferramentas: { ...ferramentas },
    }
}

export default useApi;