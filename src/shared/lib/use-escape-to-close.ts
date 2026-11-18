import { useEffect, useEffectEvent } from 'react';

export function useEscapeToClose(open: boolean, close: () => void) {
  const onClose = useEffectEvent(close);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);
}
