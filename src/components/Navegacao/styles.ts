import styled from "styled-components";

export const ContainerNavegacao = styled.div`
  display: flex;
  gap: 10px;
  background: transparent;
  padding: 0 1.5rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
`;

export const Aba = styled.button<{ $ativo: boolean }>`
  background: ${({ theme, $ativo }) => $ativo ? theme.gradients.primary : theme.glass.card};
  color: ${({ theme, $ativo }) => $ativo ? '#ffffff' : theme.colors.text};
  border: ${({ theme, $ativo }) => $ativo ? 'none' : `1px solid ${theme.colors.borderColor}`};
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  box-shadow: ${({ theme, $ativo }) => $ativo ? theme.shadows.glow : theme.shadows.soft};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(5px);

  &:hover {
    transform: translateY(-2px);
    background: ${({ theme, $ativo }) => $ativo ? theme.gradients.primary : theme.colors.hoverBackground};
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;
