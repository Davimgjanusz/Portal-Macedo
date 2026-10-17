'use client';

import { useState } from 'react';
import { FileText, Sheet, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function QuickExportButtons() {
  const [weekModalOpen, setWeekModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState('');

  async function downloadDocx() {
    if (!startDate || !endDate) {
      toast.error('Selecione as datas de início e fim.');
      return;
    }
    setLoading('docx');
    try {
      const res = await fetch(`/api/exports/weekly-docx?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error('Erro ao gerar DOCX');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-semanal-${startDate}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setWeekModalOpen(false);
      toast.success('Relatório DOCX baixado!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading('');
    }
  }

  async function exportDailySheet() {
    setLoading('sheet');
    try {
      const res = await fetch('/api/exports/daily-sheet', { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao exportar para Sheets');
      toast.success('Dados exportados para o Google Sheets!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading('');
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setWeekModalOpen(true)}>
          <FileText className="w-4 h-4" />
          Baixar DOCX Semanal
        </Button>
        <Button variant="secondary" onClick={exportDailySheet} disabled={loading === 'sheet'}>
          <Sheet className="w-4 h-4" />
          {loading === 'sheet' ? 'Exportando...' : 'Exportar Diário para Sheets'}
        </Button>
      </div>

      <Modal open={weekModalOpen} onClose={() => setWeekModalOpen(false)} title="Relatório Semanal DOCX">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Início</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fim</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
          <Button onClick={downloadDocx} disabled={loading === 'docx'} className="w-full">
            <Download className="w-4 h-4" />
            {loading === 'docx' ? 'Gerando...' : 'Gerar e Baixar'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
