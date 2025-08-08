import { useContext, useState } from 'react';
import StoreContext from '@/store';
import { LayoutType } from '@/types/LayoutType';
import { Container, Botao, Lista } from './styles';

const opcoes: LayoutType[] = ['classico','hacker','fofinho','elegante','dark','clean'];

const SelecaoLayout = () => {
    const { layout } = useContext(StoreContext);
    const [aberto, setAberto] = useState(false);
    return <Container>
        <Botao onClick={() => setAberto(!aberto)}>{layout?.get() ?? 'layout'}</Botao>
        {aberto && <Lista>
            {opcoes.map(o => <a key={o} onClick={() => { layout?.set(o); setAberto(false); }}>{o}</a>)}
        </Lista>}
    </Container>
};

export default SelecaoLayout;
