'use client';

import { useState } from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

function mesAtual() {
  return new Date().toISOString().slice(0, 7);
}

export default function QuickExportButtons() {
  const [modalAberto, setModalAberto] = useState(false);
  const [mes, setMes] = useState(mesAtual());
  const [baixando, setBaixando] = useState(false);

  async function baixarRelatorio() {
    if (!mes) {
      toast.error('Selecione o mês do relatório.');
      return;
    }
    setBaixando(true);
    try {
      const res = await fetch(`/api/exports/mensal?month=${mes}`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Erro ao gerar relatório');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${mes}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setModalAberto(false);
      toast.success('Relatório baixado. Abra no Excel ou no Google Sheets.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBaixando(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setModalAberto(true)}>
        <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
        Relatório mensal
      </Button>

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title="Relatório mensal" size="sm">
        <div className="space-y-4">
          <div>
            <label htmlFor="mes-relatorio" className="block text-sm font-medium mb-1">Mês</label>
            <input
              id="mes-relatorio"
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            A planilha traz uma aba de resumo (total de aulas, horas, recebido e pendente) e uma aba com todas as aulas do mês.
          </p>
          <Button onClick={baixarRelatorio} disabled={baixando} className="w-full">
            <Download className="w-4 h-4" aria-hidden="true" />
            {baixando ? 'Gerando...' : 'Gerar planilha'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
