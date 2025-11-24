import styled from "styled-components";

export const ContainerNavegacao = styled.div`
  display: flex;
  gap: 2px;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding: 0 1rem;
  margin-top: 1rem;
`;

export const Aba = styled.button<{ $ativo: boolean }>`
  background: ${({ theme, $ativo }) => $ativo ? theme.colors.panelBackground : 'transparent'};
  color: ${({ theme, $ativo }) => $ativo ? theme.colors.accentColor : theme.colors.foreground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-bottom: ${({ $ativo, theme }) => $ativo ? `1px solid ${theme.colors.panelBackground}` : `1px solid ${theme.colors.borderColor}`};
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  margin-bottom: -1px;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 0.875rem;

  &:hover {
    color: ${({ theme }) => theme.colors.accentColor};
    background: ${({ theme }) => theme.colors.panelBackground};
  }
`;
