'use client';

import { forwardRef } from 'react';

const Select = forwardRef(function Select(
  { label, error, children, className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--primary)] ${className}`}
        style={{
          background: 'var(--card)',
          borderColor: error ? '#EF4444' : 'var(--border)',
          color: 'var(--foreground)',
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Select;
