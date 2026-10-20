'use client';

<<<<<<< HEAD
import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
=======
import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
  { label, error, id, mask, onChange, className = '', ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  function handleChange(e) {
    if (mask) e.target.value = mask(e.target.value);
    onChange?.(e);
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
>>>>>>> master
          {label}
        </label>
      )}
      <input
        ref={ref}
<<<<<<< HEAD
=======
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={handleChange}
>>>>>>> master
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--primary)] ${className}`}
        style={{
          background: 'var(--card)',
          borderColor: error ? '#EF4444' : 'var(--border)',
          color: 'var(--foreground)',
        }}
        {...props}
      />
<<<<<<< HEAD
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
=======
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
>>>>>>> master
    </div>
  );
});

export default Input;
