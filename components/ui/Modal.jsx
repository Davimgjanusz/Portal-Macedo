'use client';

<<<<<<< HEAD
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);
=======
import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'lg' }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const maxWidth = size === 'sm' ? 'max-w-sm' : size === 'xl' ? 'max-w-2xl' : 'max-w-lg';
>>>>>>> master

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
<<<<<<< HEAD
    if (open) {
      dialog.showModal();
    } else {
=======
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
>>>>>>> master
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
<<<<<<< HEAD
      className="rounded-xl border p-0 w-full max-w-lg backdrop:bg-black/50"
      style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
    >
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="rounded-lg p-1 hover:bg-[var(--muted)] transition-colors">
          <X className="w-5 h-5" />
=======
      aria-labelledby={titleId}
      className={`m-auto rounded-xl border p-0 w-[calc(100%-2rem)] ${maxWidth} shadow-2xl backdrop:bg-slate-950/70 backdrop:backdrop-blur-[2px]`}
      style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
    >
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
        <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="rounded-lg p-1 hover:bg-[var(--muted)] transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
>>>>>>> master
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
