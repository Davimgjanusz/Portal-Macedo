'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useDashboard } from '@/components/admin/useDashboard';
import {
  User,
  Phone,
  Mail,
  Plus,
  FileText,
  Download,
  Monitor,
  MapPin,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  DollarSign,
  Filter,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import LessonRegistrationModal from '@/components/admin/LessonRegistrationModal';
import LessonDetailModal from '@/components/admin/LessonDetailModal';
import { formatarIntervalo } from '@/lib/horarios';

const brl = (v) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

export default function StudentProfilePage() {
  const { id } = useParams();
  const { user } = useDashboard();
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [aulas, setAulas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [detalheAberto, setDetalheAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const [{ data: profileData, error: profileErr }, { data: aulasData, error: aulasErr }] = await Promise.all([
        supabase.from('profiles').select('id, nome, email, telefone').eq('id', id).single(),
        supabase
          .from('aulas_registro')
          .select('id, data_aula, hora_inicio, hora_fim, modalidade, endereco, duracao_horas, valor_pago, status_pagamento, conteudo_ensinado, teve_tarefa, descricao_tarefa')
          .eq('student_id', id)
          .order('data_aula', { ascending: false }),
      ]);

      if (profileErr) toast.error('Erro ao carregar perfil do aluno.');
      if (aulasErr) toast.error('Erro ao carregar aulas.');

      setStudent(profileData);
      setAulas(aulasData || []);
    } catch {
      toast.error('Erro de conexão ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAulas = useMemo(
    () =>
      aulas.filter((a) => {
        if (dateFrom && a.data_aula < dateFrom) return false;
        if (dateTo && a.data_aula > dateTo) return false;
        return true;
      }),
    [aulas, dateFrom, dateTo]
  );

  const totalPago = useMemo(
    () => filteredAulas.filter((a) => a.status_pagamento === 'pago').reduce((s, a) => s + Number(a.valor_pago), 0),
    [filteredAulas]
  );
  const totalPendente = useMemo(
    () => filteredAulas.filter((a) => a.status_pagamento === 'pendente').reduce((s, a) => s + Number(a.valor_pago), 0),
    [filteredAulas]
  );

  async function excluirAluno() {
    setExcluindo(true);
    try {
      const res = await fetch(`/api/alunos/${id}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Não foi possível excluir o aluno');
      toast.success('Aluno excluído. O acesso dele foi bloqueado e o histórico foi preservado.');
      router.push('/admin/alunos');
    } catch (err) {
      toast.error(err.message);
      setExcluindo(false);
      setConfirmarExclusao(false);
    }
  }

  function aoAlterarAula(atualizada) {
    setAulas((prev) => prev.map((a) => (a.id === atualizada.id ? { ...a, ...atualizada } : a)));
  }

  async function exportPdf() {
    setExportingPdf(true);
    try {
      const res = await fetch(`/api/exports/student-pdf?studentId=${id}`);
      if (!res.ok) throw new Error('Erro ao gerar PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dossie-${student?.nome || 'aluno'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Dossiê PDF baixado!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExportingPdf(false);
    }
  }

  if (loading) return <Spinner label="Carregando ficha do aluno" />;

  if (!student) {
    return (
      <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
        Aluno não encontrado.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full p-3" style={{ background: 'var(--muted)' }}>
            <User className="w-8 h-8" style={{ color: 'var(--primary)' }} aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{student.nome}</h1>
            <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" aria-hidden="true" /> {student.email}
              </span>
              {student.telefone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" /> {student.telefone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" aria-hidden="true" /> Registrar aula
          </Button>
          <Button variant="secondary" onClick={exportPdf} disabled={exportingPdf}>
            <Download className="w-4 h-4" aria-hidden="true" />
            {exportingPdf ? 'Gerando...' : 'Dossiê PDF'}
          </Button>
          <Button variant="danger" onClick={() => setConfirmarExclusao(true)}>
            <Trash2 className="w-4 h-4" aria-hidden="true" /> Excluir aluno
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Total de aulas</p>
          <p className="text-xl font-bold">{filteredAulas.length}</p>
        </Card>
        <Card>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Recebido</p>
          <p className="text-xl font-bold" style={{ color: '#0F8A5F' }}>{brl(totalPago)}</p>
        </Card>
        <Card>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Pendente</p>
          <p className="text-xl font-bold" style={{ color: '#B45309' }}>{brl(totalPendente)}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} aria-hidden="true" />
            <span className="text-sm font-medium">Filtrar por período</span>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label htmlFor="data-de" className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>De</label>
              <input
                id="data-de"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label htmlFor="data-ate" className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Até</label>
              <input
                id="data-ate"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:brightness-95"
                style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
              >
                Limpar período
              </button>
            )}
          </div>
        </div>
      </Card>

      <section aria-labelledby="historico">
        <h2 id="historico" className="text-lg font-semibold mb-4">
          Histórico de aulas
          {(dateFrom || dateTo) && (
            <span className="text-sm font-normal ml-2" style={{ color: 'var(--muted-foreground)' }}>
              ({filteredAulas.length} de {aulas.length})
            </span>
          )}
        </h2>
        {filteredAulas.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
            {aulas.length === 0 ? 'Nenhuma aula registrada.' : 'Nenhuma aula encontrada no período selecionado.'}
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredAulas.map((aula) => {
              const pago = aula.status_pagamento === 'pago';
              return (
                <li key={aula.id}>
                  <div
                    className="rounded-xl border p-4 transition-shadow hover:shadow-md"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5">
                          {aula.modalidade === 'online' ? (
                            <Monitor className="w-4 h-4" style={{ color: '#06B6D4' }} aria-label="Online" />
                          ) : (
                            <MapPin className="w-4 h-4" style={{ color: '#F97316' }} aria-label="Presencial" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {new Date(aula.data_aula + 'T12:00:00').toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-sm mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>
                            <BookOpen className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                            {aula.conteudo_ensinado}
                          </p>
                          {aula.teve_tarefa && (
                            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                              <FileText className="w-3 h-3" aria-hidden="true" />
                              Lição: {aula.descricao_tarefa || 'sim'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                          <ClockIcon className="w-3.5 h-3.5" aria-hidden="true" />{' '}
                          {formatarIntervalo(aula.hora_inicio, aula.hora_fim) || `${Number(aula.duracao_horas).toFixed(1)}h`}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <DollarSign className="w-3.5 h-3.5" aria-hidden="true" />
                          {brl(aula.valor_pago)}
                        </span>
                        <span
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: pago ? '#10B98120' : '#F59E0B20',
                            color: pago ? '#0F8A5F' : '#B45309',
                          }}
                        >
                          {pago ? (
                            <><CheckCircle className="w-3 h-3" aria-hidden="true" /> Pago</>
                          ) : (
                            <><AlertCircle className="w-3 h-3" aria-hidden="true" /> Pendente</>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAulaSelecionada(aula);
                            setDetalheAberto(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:brightness-110 active:scale-[0.97]"
                          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                          aria-label={`Editar aula de ${new Date(aula.data_aula + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <LessonDetailModal
        aula={aulaSelecionada}
        open={detalheAberto}
        onClose={() => setDetalheAberto(false)}
        onChanged={aoAlterarAula}
      />

      <ConfirmModal
        open={confirmarExclusao}
        onClose={() => setConfirmarExclusao(false)}
        onConfirm={excluirAluno}
        title="Excluir aluno?"
        description={`${student.nome} perderá o acesso ao portal e sairá da lista de alunos. O histórico de aulas e pagamentos será mantido para fins financeiros.`}
        confirmLabel="Excluir aluno"
        variant="danger"
        loading={excluindo}
      />

      <LessonRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        studentId={id}
        teacherId={user.id}
        onSuccess={loadData}
      />
    </div>
  );
}
