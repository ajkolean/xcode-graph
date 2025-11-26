/**
 * Custom hook for keyboard shortcuts
 * Extracted from App.tsx for better modularity
 */

import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onCloseNode: () => void;
  onResetView: () => void;
}

export function useKeyboardShortcuts({ onCloseNode, onResetView }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close panels
      if (e.key === 'Escape') {
        onCloseNode();
      }
      
      // Cmd/Ctrl + F to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
      
      // R to reset view
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
        onResetView();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCloseNode, onResetView]);
}