import * as projetos from "./projetos"
import * as dominios from "./dominios"

const useApi = () => {
    return {
        projeto: { ...projetos },
        dominios: { ...dominios }
    }
}

export default useApi;