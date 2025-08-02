import styled, { keyframes } from "styled-components";

const jellyIn = keyframes`
  0% {
    transform: translate(-50vw, 50vh) scale(0);
  }
  50% {
    transform: translate(0, 0) scale(1.1);
  }
  75% {
    transform: translate(0, 0) scale0.95);
  }
  85% {
    transform: translate(0, 0) scale(0.92);
  }
  95% {
    transform: translate(0, 0) scale(1.05);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
`;

const jellyOut = keyframes`
  0% {
    transform: translate(0, 0) scale(1);
  }
  15% {
    transform: translate(0, 0) scale(1.1);
  }
  25% {
    transform: translate(0, 0) scale(0.9);
  }
  100% {
    transform: translate(-50vw, 50vh) scale(0);
  }
`;

export const StyledModal = styled.div<{ o: string }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ o }) => (o ? "flex" : "none")};
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

export const StyledModalContent = styled.div<{ c?: string }>`
  width: 50%;
  height: 50%;
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: ${({ c }) => (c ? jellyOut : jellyIn)} 0.7s
    cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  position: relative;
  overflow: auto;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: -10px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;