'use client';

import {
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Monitor,
  MapPin,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function KpiCard({ icon: Icon, label, value, color = 'var(--primary)' }) {
  const bgColor = color.startsWith('#') ? hexToRgba(color, 0.12) : `color-mix(in srgb, ${color} 12%, transparent)`;
  return (
    <div
      className="rounded-xl border p-4 shadow-sm"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg p-2" style={{ background: bgColor }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {label}
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--card-foreground)' }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatBRL(v) {
  return `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
}

export default function DashboardKpiCards({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Financeiro
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard icon={DollarSign} label="Hoje" value={formatBRL(data.ganho_hoje)} color="#10B981" />
          <KpiCard icon={DollarSign} label="Semana" value={formatBRL(data.ganho_semana)} color="#10B981" />
          <KpiCard icon={TrendingUp} label="Mês" value={formatBRL(data.ganho_mes)} color="#2563EB" />
          <KpiCard icon={TrendingUp} label="Ano" value={formatBRL(data.ganho_ano)} color="#2563EB" />
          <KpiCard icon={AlertCircle} label="Pendente" value={formatBRL(data.valor_pendente)} color="#F59E0B" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Operacional (Mês Atual)
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={Users} label="Alunos Ativos" value={data.alunos_ativos_mes ?? 0} color="#2563EB" />
          <KpiCard icon={Clock} label="Horas de Aula" value={`${Number(data.total_horas_mes || 0).toFixed(1)}h`} color="#8B5CF6" />
          <KpiCard icon={Monitor} label="Online" value={data.aulas_chamada_mes ?? 0} color="#06B6D4" />
          <KpiCard icon={MapPin} label="Presenciais" value={data.aulas_presenciais_mes ?? 0} color="#F97316" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <KpiCard icon={BookOpen} label="Total Aulas (Mês)" value={data.total_aulas_mes ?? 0} />
        <KpiCard
          icon={BookOpen}
          label="Lições de Casa"
          value={`${data.taxa_tarefas_passadas ?? 0}%`}
          color="#10B981"
        />
      </div>
    </div>
  );
}
