'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-toastify';
import { useDashboard } from '@/components/admin/useDashboard';
import DashboardKpiCards from '@/components/admin/DashboardKpiCards';
import DashboardCharts from '@/components/admin/DashboardCharts';
import QuickExportButtons from '@/components/admin/QuickExportButtons';
import Spinner from '@/components/ui/Spinner';

const MESES = 6;

function inicioPeriodo() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - (MESES - 1), 1);
}

function buildMonthly(rows) {
  const inicio = inicioPeriodo();
  const meses = Array.from({ length: MESES }, (_, i) => {
    const d = new Date(inicio.getFullYear(), inicio.getMonth() + i, 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      faturamento: 0,
      aulas: 0,
    };
  });
  const porMes = Object.fromEntries(meses.map((m) => [m.key, m]));
  for (const r of rows) {
    const mes = porMes[r.data_aula.slice(0, 7)];
    if (!mes) continue;
    mes.aulas += 1;
    if (r.status_pagamento === 'pago') mes.faturamento += Number(r.valor_pago);
  }
  return meses;
}

export default function AdminDashboard() {
  const { user } = useDashboard();
  const [analytics, setAnalytics] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const inicio = inicioPeriodo();
      const inicioISO = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-01`;

      const [{ data, error }, { data: aulas, error: aulasErr }] = await Promise.all([
        supabase.rpc('get_teacher_dashboard_analytics', { p_teacher_id: user.id }),
        supabase
          .from('aulas_registro')
          .select('data_aula, valor_pago, status_pagamento, modalidade')
          .gte('data_aula', inicioISO),
      ]);

      if (error) toast.error('Erro ao carregar métricas: ' + error.message);
      else setAnalytics(data);

      if (aulasErr) toast.error('Erro ao carregar gráficos: ' + aulasErr.message);
      else setRows(aulas || []);

      setLoading(false);
    }
    load();
  }, [user.id]);

  const monthly = useMemo(() => buildMonthly(rows), [rows]);

  const modalidade = useMemo(
    () => [
      { nome: 'Online', total: rows.filter((r) => r.modalidade === 'online').length },
      { nome: 'Presencial', total: rows.filter((r) => r.modalidade === 'presencial').length },
    ],
    [rows]
  );

  const status = useMemo(
    () => ({
      pago: rows.filter((r) => r.status_pagamento === 'pago').reduce((s, r) => s + Number(r.valor_pago), 0),
      pendente: rows.filter((r) => r.status_pagamento === 'pendente').reduce((s, r) => s + Number(r.valor_pago), 0),
    }),
    [rows]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <QuickExportButtons />
      </div>

      {loading ? (
        <Spinner label="Carregando indicadores" />
      ) : (
        <>
          <DashboardKpiCards data={analytics} />
          <DashboardCharts monthly={monthly} modalidade={modalidade} status={status} />
        </>
      )}
    </div>
  );
}
