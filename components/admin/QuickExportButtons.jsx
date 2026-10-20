'use client';

import { useState } from 'react';
<<<<<<< HEAD
import { FileText, Sheet, Download } from 'lucide-react';
=======
import { FileSpreadsheet, Download } from 'lucide-react';
>>>>>>> master
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

<<<<<<< HEAD
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
=======
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
>>>>>>> master
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
<<<<<<< HEAD
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
=======
      a.download = `relatorio-${mes}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setModalAberto(false);
      toast.success('Relatório baixado. Abra no Excel ou no Google Sheets.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBaixando(false);
>>>>>>> master
    }
  }

  return (
    <>
<<<<<<< HEAD
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
=======
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
>>>>>>> master
          </Button>
        </div>
      </Modal>
    </>
  );
}
