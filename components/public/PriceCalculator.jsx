'use client';

import { useState } from 'react';
import { Monitor, MapPin, Clock, Calculator } from 'lucide-react';

const TAXA_HORA = 40;
const TAXA_TRANSPORTE = 13;

export default function PriceCalculator() {
  const [modalidade, setModalidade] = useState('online');
  const [horas, setHoras] = useState(1);

  const isPresencial = modalidade === 'presencial';
  const valorAulas = horas * TAXA_HORA;
  const transporte = isPresencial ? TAXA_TRANSPORTE : 0;
  const valorTotal = valorAulas + transporte;

  return (
    <section id="simulador" className="w-full max-w-2xl mx-auto px-4">
      <div
        className="rounded-2xl border p-6 sm:p-8 shadow-sm"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          <h3 className="text-xl font-bold">Simulador de Orçamento</h3>
        </div>

        {/* Toggle Modalidade */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
            Modalidade da Aula
          </label>
          <div
            className="inline-flex rounded-lg p-1"
            style={{ background: 'var(--muted)' }}
          >
            <button
              type="button"
              onClick={() => setModalidade('online')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                modalidade === 'online'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--card)]'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Por Chamada (Online)
            </button>
            <button
              type="button"
              onClick={() => setModalidade('presencial')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                modalidade === 'presencial'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--card)]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Presencial
            </button>
          </div>
        </div>

        {/* Slider de Horas */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
            <Clock className="w-4 h-4 inline mr-1" />
            Duração da aula
          </label>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.5"
            value={horas}
            onChange={(e) => setHoras(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
            style={{ background: 'var(--muted)' }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            <span>0.5h</span>
            <span className="hidden sm:inline">1h</span>
            <span>1.5h</span>
            <span className="hidden sm:inline">2h</span>
            <span>2.5h</span>
            <span className="hidden sm:inline">3h</span>
            <span>3.5h</span>
            <span>4h</span>
          </div>
          <p className="text-center text-lg font-semibold mt-2">
            {horas} {horas === 1 ? 'hora' : 'horas'}
          </p>
        </div>

        {/* Resultado */}
        <div
          className="rounded-xl p-5 space-y-3"
          style={{ background: 'var(--muted)' }}
        >
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--muted-foreground)' }}>
              {horas}h × R$ {TAXA_HORA},00/h
            </span>
            <span className="font-medium">R$ {valorAulas.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--muted-foreground)' }}>
              Taxa de deslocamento {isPresencial ? '' : '(isento)'}
            </span>
            <span className="font-medium">
              {isPresencial ? `R$ ${TAXA_TRANSPORTE.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
            </span>
          </div>

          {isPresencial && (
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              ({horas} × R$ 40) + R$ 13 de transporte
            </p>
          )}

          <hr style={{ borderColor: 'var(--border)' }} />

          <div className="flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
              R$ {valorTotal.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <p className="text-xs text-center mt-4" style={{ color: 'var(--muted-foreground)' }}>
          Valores por sessão individual. Sem mensalidade ou matrícula.
        </p>
      </div>
    </section>
  );
}
