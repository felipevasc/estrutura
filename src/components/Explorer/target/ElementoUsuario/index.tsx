import { FaUser } from 'react-icons/fa';
import { Item, Tree } from 'src/common/components/Menu';

interface ElementoUsuarioProps {
    usuario: {
        id: number;
        nome: string;
    }
}

const ElementoUsuario = ({ usuario }: ElementoUsuarioProps) => {
    return (
        <Item
            level={0}
            icon={<FaUser />}
            title={usuario.nome}
        />
    );
};

export default ElementoUsuario;
