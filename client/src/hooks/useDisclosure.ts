import { useState } from 'react';

const useDisclosure = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onToggle = () => setIsOpen((prev) => !prev);

  return { isOpen, onOpen, onClose, onToggle };
}

export default useDisclosure;