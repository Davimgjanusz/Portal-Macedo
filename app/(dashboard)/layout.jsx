import { Suspense } from 'react';
import DashboardShell from '@/components/admin/DashboardShell';
<<<<<<< HEAD
=======
import Spinner from '@/components/ui/Spinner';
>>>>>>> master

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={
<<<<<<< HEAD
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted-foreground)' }}>
        Carregando...
=======
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
>>>>>>> master
      </div>
    }>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
