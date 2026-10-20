'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = forwardRef(function PasswordInput({ label, error, id, className = '', ...props }, ref) {
  const [visible, setVisible] = useState(false);
  const inputId = id || props.name;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          autoComplete={props.autoComplete}
          className={`w-full rounded-lg border pl-3 pr-11 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--primary)] ${className}`}
          style={{
            background: 'var(--card)',
            borderColor: error ? '#EF4444' : 'var(--border)',
            color: 'var(--foreground)',
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors hover:bg-[var(--muted)]"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {visible ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});

export default PasswordInput;
