'use client';

import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--primary)] ${className}`}
        style={{
          background: 'var(--card)',
          borderColor: error ? '#EF4444' : 'var(--border)',
          color: 'var(--foreground)',
        }}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
