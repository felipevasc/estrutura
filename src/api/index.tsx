import * as projetos from "./projetos"

const useApi = () => {
    return {
        projeto: { ...projetos }
    }
}

export default useApi;