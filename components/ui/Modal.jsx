'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-xl border p-0 w-full max-w-lg backdrop:bg-black/50"
      style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
    >
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="rounded-lg p-1 hover:bg-[var(--muted)] transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
