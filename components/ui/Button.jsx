'use client';

import { forwardRef } from 'react';

const variants = {
  primary:
    'text-[var(--primary-foreground)] hover:opacity-90',
  secondary:
    'border text-[var(--foreground)] hover:opacity-80',
  ghost:
    'hover:bg-[var(--muted)] text-[var(--foreground)]',
  danger:
    'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      style={
        variant === 'primary'
          ? { background: 'var(--primary)' }
          : variant === 'secondary'
            ? { borderColor: 'var(--border)', background: 'var(--card)' }
            : undefined
      }
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
