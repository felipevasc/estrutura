'use client';
import { useContext } from 'react';
import StoreContext from '@/store';
import { temas } from '@/theme';
import { SelectTema } from './styles';

export default function SelecaoTema() {
  const { tema } = useContext(StoreContext);
  return (
    <SelectTema value={tema?.get()} onChange={e => tema?.set(e.target.value)}>
      {Object.keys(temas).map(opcao => (
        <option key={opcao} value={opcao}>{opcao}</option>
      ))}
    </SelectTema>
  );
}
