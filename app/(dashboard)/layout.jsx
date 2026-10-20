import { Suspense } from 'react';
import DashboardShell from '@/components/admin/DashboardShell';
import Spinner from '@/components/ui/Spinner';

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    }>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
