import { useContext } from "react";
import StoreContext from "@/store";
import { BreadcrumbBar } from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHome } from "@fortawesome/free-solid-svg-icons";

const Breadcrumbs = () => {
    const { selecaoTarget, projeto } = useContext(StoreContext);
    const target = selecaoTarget?.get();
    const currentProject = projeto?.get();

    // Ideally, we would traverse the tree or store the path.
    // For now, we construct a logical path: Project -> Target Type -> Target Value

    return (
        <BreadcrumbBar>
            <div className="item">
                <FontAwesomeIcon icon={faHome} />
            </div>

            {currentProject && (
                <>
                    <FontAwesomeIcon icon={faChevronRight} className="separator" />
                    <div className="item">{currentProject.nome}</div>
                </>
            )}

            {target && (
                <>
                    <FontAwesomeIcon icon={faChevronRight} className="separator" />
                    <div className="item">{target.tipo.toUpperCase()}</div>
                    <FontAwesomeIcon icon={faChevronRight} className="separator" />
                    <div className="item active">{target.valor}</div>
                </>
            )}
        </BreadcrumbBar>
    );
};

export default Breadcrumbs;
