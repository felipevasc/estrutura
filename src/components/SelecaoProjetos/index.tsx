import useApi from "@/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faHome, faMosque, faMosquito, faShippingFast, faSpiral, faTruckLoading, faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/common/components";

const SelecaoProjetos = () => {
    const api = useApi();
    const { data, error, isLoading } = api.projeto.getProjetos();

    return <>
        {isLoading && <FontAwesomeIcon icon={faSpiral} spin />}
        {!isLoading && !error && data?.map(p => <Button key={p.id} darkMode>{p.nome}</Button>)}
        <FontAwesomeIcon icon={faBriefcase} />
    </>
}

export default SelecaoProjetos;