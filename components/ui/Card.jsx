export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${className}`}
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
