import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ msg: '', type: 's', show: false });

  const showToast = useCallback((msg, type = 's') => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }, []);

  return { toast, showToast };
}
