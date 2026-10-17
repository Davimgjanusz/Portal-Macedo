'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardKpiCards from '@/components/admin/DashboardKpiCards';
import QuickExportButtons from '@/components/admin/QuickExportButtons';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase.rpc('get_teacher_dashboard_analytics', {
        p_teacher_id: user.id,
      });

      if (!error) setAnalytics(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <QuickExportButtons />
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
          Carregando métricas...
        </div>
      ) : (
        <DashboardKpiCards data={analytics} />
      )}
    </div>
  );
}
