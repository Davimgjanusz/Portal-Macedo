import { Suspense } from 'react';
import DashboardShell from '@/components/admin/DashboardShell';

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted-foreground)' }}>
        Carregando...
      </div>
    }>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
