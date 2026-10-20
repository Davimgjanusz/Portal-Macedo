'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
        {description}
      </p>
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          {cancelLabel}
        </Button>
        <Button type="button" variant={variant} onClick={onConfirm} disabled={loading} className="flex-1">
          {loading ? 'Aguarde...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
