'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { celulasDoMes, hojeIso, tituloDoMes } from '@/lib/calendario';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function MonthCalendar({ ano, mes, onNavegar, onHoje, aulas, diaSelecionado, onSelecionarDia }) {
  const celulas = useMemo(() => celulasDoMes(ano, mes), [ano, mes]);
  const porDia = useMemo(() => {
    const mapa = {};
    for (const a of aulas) {
      (mapa[a.data_aula] ||= []).push(a);
    }
    return mapa;
  }, [aulas]);
  const hoje = hojeIso();

  return (
    <div className="rounded-2xl border p-4 sm:p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavegar(-1)}
            aria-label="Mês anterior"
            className="p-2 rounded-lg transition-colors hover:bg-[var(--muted)]"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onNavegar(1)}
            aria-label="Próximo mês"
            className="p-2 rounded-lg transition-colors hover:bg-[var(--muted)]"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <h2 className="font-display font-semibold text-base sm:text-lg" aria-live="polite">
          {tituloDoMes(ano, mes)}
        </h2>
        <button
          type="button"
          onClick={onHoje}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--muted)]"
          style={{ color: 'var(--primary)' }}
        >
          Hoje
        </button>
      </div>

      <div role="grid" aria-label={tituloDoMes(ano, mes)}>
        <div role="row" className="grid grid-cols-7 mb-1">
          {DIAS_SEMANA.map((d) => (
            <div key={d} role="columnheader" className="text-center text-xs font-medium py-1" style={{ color: 'var(--muted-foreground)' }}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {celulas.map((iso, i) => {
            if (!iso) return <div key={`vazio-${i}`} className="aspect-square sm:aspect-auto sm:min-h-[68px]" aria-hidden="true" />;

            const lista = porDia[iso] || [];
            const selecionado = iso === diaSelecionado;
            const eHoje = iso === hoje;
            const dia = Number(iso.slice(8, 10));

            return (
              <button
                key={iso}
                type="button"
                onClick={() => onSelecionarDia(iso)}
                aria-pressed={selecionado}
                aria-label={`${dia}, ${lista.length === 0 ? 'sem aulas' : `${lista.length} aula${lista.length > 1 ? 's' : ''}`}`}
                className={`flex flex-col items-center justify-start gap-1 rounded-lg p-1 sm:p-2 aspect-square sm:aspect-auto sm:min-h-[68px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
                  selecionado
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent'
                    : `text-[var(--foreground)] hover:bg-[var(--muted)] hover:border-[var(--primary)] ${eHoje ? 'border-[var(--primary)]' : 'border-transparent'}`
                }`}
              >
                <span className={`text-sm ${eHoje ? 'font-bold' : 'font-medium'}`}>{dia}</span>
                {lista.length > 0 && (
                  <span className="flex items-center gap-0.5" aria-hidden="true">
                    {lista.slice(0, 3).map((a) => (
                      <span
                        key={a.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: a.status_pagamento === 'pago' ? '#10B981' : '#F59E0B' }}
                      />
                    ))}
                    {lista.length > 3 && <span className="text-[10px] leading-none ml-0.5">+{lista.length - 3}</span>}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} aria-hidden="true" /> Paga</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} aria-hidden="true" /> Pendente</span>
      </div>
    </div>
  );
}
