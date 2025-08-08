'use client';
import { ReactNode, useContext } from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from './globalStyles';
import temas from './temas';
import StoreContext from '@/store';

type Props = { children: ReactNode };

export default function AplicacaoTema({ children }: Props) {
  const { tema } = useContext(StoreContext);
  const chave = tema?.get() || 'dark';
  const estilo = temas[chave as keyof typeof temas];
  return (
    <ThemeProvider theme={estilo}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}
