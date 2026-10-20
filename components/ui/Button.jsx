'use client';

import { forwardRef } from 'react';

const variants = {
  primary:
    'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm hover:brightness-110 hover:shadow-md',
  secondary:
    'border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-sm hover:bg-[var(--muted)] hover:border-[var(--primary)]',
  ghost:
    'text-[var(--foreground)] hover:bg-[var(--muted)]',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md',
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
