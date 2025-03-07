// src/hooks/useDrawer.ts

import { useState, useCallback, useEffect } from 'react';

export interface UseDrawerResult {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

export function useDrawer(initialState = false): UseDrawerResult {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Close drawer on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  return {
    isOpen,
    toggle,
    close,
    open
  };
}