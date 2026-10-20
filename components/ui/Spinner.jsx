export default function Spinner({ className = '', label = 'Carregando' }) {
  return (
    <div role="status" className={`flex items-center justify-center py-12 ${className}`}>
      <div
        aria-hidden="true"
        className="w-8 h-8 border-[3px] rounded-full animate-spin motion-reduce:animate-none"
        style={{
          borderColor: 'var(--border)',
          borderTopColor: 'var(--primary)',
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
