'use client';

import { Check, X } from 'lucide-react';
import { checarSenha } from '@/lib/password';

const COR = { fraca: '#DC2626', média: '#D97706', forte: '#059669' };

export default function PasswordStrength({ password, email }) {
  if (!password) return null;
  const { regras, nivel, satisfeitas, contemEmail } = checarSenha(password, email);
  const total = 6;
  const cor = COR[nivel];

  return (
    <div className="space-y-2 text-xs" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex-1 grid grid-cols-6 gap-1" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className="h-1.5 rounded-full" style={{ background: i < satisfeitas ? cor : 'var(--muted)' }} />
          ))}
        </div>
        <span className="font-medium capitalize" style={{ color: cor }}>
          Força: {nivel}
        </span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {regras.map((r) => (
          <li key={r.id} className="flex items-center gap-1.5" style={{ color: r.ok ? '#059669' : 'var(--muted-foreground)' }}>
            {r.ok ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <X className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>{r.label}</span>
            <span className="sr-only">{r.ok ? '(atendido)' : '(não atendido)'}</span>
          </li>
        ))}
        {contemEmail && (
          <li className="flex items-center gap-1.5 text-red-600">
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Não use parte do seu e-mail na senha</span>
          </li>
        )}
      </ul>
    </div>
  );
}
