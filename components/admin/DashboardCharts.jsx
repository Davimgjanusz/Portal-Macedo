'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { CheckCircle2, Clock } from 'lucide-react';

const PALETTE = {
  light: { series: '#2a78d6', good: '#0ca30c', warning: '#fab219', grid: '#e1e0d9', axis: '#898781', text: '#52514e' },
  dark: { series: '#3987e5', good: '#0ca30c', warning: '#fab219', grid: '#2c2c2a', axis: '#898781', text: '#c3c2b7' },
};

const brl = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

function ChartCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
      {children}
    </section>
  );
}

export default function DashboardCharts({ monthly, modalidade, status }) {
  const dark = useDarkMode();
  const c = dark ? PALETTE.dark : PALETTE.light;
  const axisProps = { stroke: c.axis, tick: { fill: c.text, fontSize: 12 }, tickLine: false, axisLine: { stroke: c.grid } };
  const totalStatus = status.pago + status.pendente;
  const pctPago = totalStatus > 0 ? Math.round((status.pago / totalStatus) * 100) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Faturamento mensal" description="Valores recebidos nos últimos 6 meses">
        <div role="img" aria-label="Gráfico de barras do faturamento mensal">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={c.grid} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} width={70} tickFormatter={(v) => brl(v)} />
              <Tooltip
                cursor={{ fill: c.grid, opacity: 0.4 }}
                formatter={(v) => [brl(v), 'Faturamento']}
                contentStyle={{ background: 'var(--card)', border: `1px solid ${c.grid}`, borderRadius: 8, color: 'var(--foreground)' }}
              />
              <Bar dataKey="faturamento" fill={c.series} radius={[4, 4, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Aulas por mês" description="Quantidade de aulas registradas nos últimos 6 meses">
        <div role="img" aria-label="Gráfico de linha da quantidade de aulas por mês">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={c.grid} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} width={40} allowDecimals={false} />
              <Tooltip
                formatter={(v) => [v, 'Aulas']}
                contentStyle={{ background: 'var(--card)', border: `1px solid ${c.grid}`, borderRadius: 8, color: 'var(--foreground)' }}
              />
              <Line type="monotone" dataKey="aulas" stroke={c.series} strokeWidth={2.5} dot={{ r: 4, fill: c.series, strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Situação dos pagamentos" description="Quanto já foi recebido e quanto ainda está pendente">
        <div className="space-y-5 pt-2">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" style={{ color: c.good }} aria-hidden="true" />
                Pago
              </span>
              <span style={{ color: 'var(--muted-foreground)' }}>{brl(status.pago)} · {pctPago}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }} role="progressbar" aria-label="Percentual pago" aria-valuenow={pctPago} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full" style={{ width: `${pctPago}%`, background: c.good }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4" style={{ color: c.warning }} aria-hidden="true" />
                Pendente
              </span>
              <span style={{ color: 'var(--muted-foreground)' }}>{brl(status.pendente)} · {100 - pctPago}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
              <div className="h-full rounded-full" style={{ width: `${100 - pctPago}%`, background: c.warning }} />
            </div>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Modalidade das aulas" description="Aulas online e presenciais nos últimos 6 meses">
        <div role="img" aria-label="Gráfico de barras horizontais das aulas por modalidade">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={modalidade} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke={c.grid} />
              <XAxis type="number" allowDecimals={false} {...axisProps} />
              <YAxis type="category" dataKey="nome" width={90} {...axisProps} />
              <Tooltip
                cursor={{ fill: c.grid, opacity: 0.4 }}
                formatter={(v) => [v, 'Aulas']}
                contentStyle={{ background: 'var(--card)', border: `1px solid ${c.grid}`, borderRadius: 8, color: 'var(--foreground)' }}
              />
              <Bar dataKey="total" fill={c.series} radius={[0, 4, 4, 0]} maxBarSize={28} label={{ position: 'right', fill: c.text, fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
