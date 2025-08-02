import { useState, useEffect } from "react";
import { StyledModal, StyledModalContent, CloseButton } from "./styles";

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({ children, isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 1000);
  };

  return (
    <StyledModal o={isOpen ? "open" : ""}>
      <StyledModalContent c={isClosing ? "closing" : ""}>
        <CloseButton onClick={handleClose}>&times;</CloseButton>
        {children}
      </StyledModalContent>
    </StyledModal>
  );
};

export default Modal;

