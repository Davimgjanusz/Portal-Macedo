'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  Clock as ClockIcon,
  DollarSign,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LessonRegistrationModal from '@/components/admin/LessonRegistrationModal';

export default function StudentProfilePage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setTeacherId(user?.id);

    const [{ data: profileData }, { data: aulasData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase
        .from('aulas_registro')
        .select('*')
        .eq('student_id', id)
        .order('data_aula', { ascending: false }),
    ]);

    setStudent(profileData);
    setAulas(aulasData || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  if (loading) {
    return (
      <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
        Carregando ficha do aluno...
      </p>
    );
  }

  if (!student) {
    return (
      <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
        Aluno não encontrado.
      </p>
    );
  }

  const totalPago = aulas
    .filter((a) => a.status_pagamento === 'pago')
    .reduce((s, a) => s + Number(a.valor_pago), 0);
  const totalPendente = aulas
    .filter((a) => a.status_pagamento === 'pendente')
    .reduce((s, a) => s + Number(a.valor_pago), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full p-3" style={{ background: 'var(--muted)' }}>
            <User className="w-8 h-8" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{student.nome}</h1>
            <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {student.email}
              </span>
              {student.telefone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {student.telefone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> Registrar Aula
          </Button>
          <Button variant="secondary" onClick={exportPdf} disabled={exportingPdf}>
            <Download className="w-4 h-4" />
            {exportingPdf ? 'Gerando...' : 'Dossiê PDF'}
          </Button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Total Aulas</p>
          <p className="text-xl font-bold">{aulas.length}</p>
        </Card>
        <Card>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Pago</p>
          <p className="text-xl font-bold" style={{ color: '#10B981' }}>
            R$ {totalPago.toFixed(2).replace('.', ',')}
          </p>
        </Card>
        <Card>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Pendente</p>
          <p className="text-xl font-bold" style={{ color: '#F59E0B' }}>
            R$ {totalPendente.toFixed(2).replace('.', ',')}
          </p>
        </Card>
      </div>

      {/* Timeline de Aulas */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Histórico de Aulas</h2>
        {aulas.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
            Nenhuma aula registrada.
          </p>
        ) : (
          <div className="space-y-3">
            {aulas.map((aula) => (
              <Card key={aula.id} className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {aula.modalidade === 'online' ? (
                        <Monitor className="w-4 h-4" style={{ color: '#06B6D4' }} />
                      ) : (
                        <MapPin className="w-4 h-4" style={{ color: '#F97316' }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(aula.data_aula + 'T12:00:00').toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                        {aula.conteudo_ensinado}
                      </p>
                      {aula.teve_tarefa && (
                        <p className="text-xs mt-1" style={{ color: '#2563EB' }}>
                          <FileText className="w-3 h-3 inline mr-1" />
                          Lição: {aula.descricao_tarefa || 'Sim'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                      <ClockIcon className="w-3.5 h-3.5" /> {Number(aula.duracao_horas).toFixed(1)}h
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <DollarSign className="w-3.5 h-3.5" />
                      R$ {Number(aula.valor_pago).toFixed(2).replace('.', ',')}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: aula.status_pagamento === 'pago' ? '#10B98120' : '#F59E0B20',
                        color: aula.status_pagamento === 'pago' ? '#10B981' : '#F59E0B',
                      }}
                    >
                      {aula.status_pagamento === 'pago' ? (
                        <><CheckCircle className="w-3 h-3 inline mr-0.5" />Pago</>
                      ) : (
                        'Pendente'
                      )}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <LessonRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        studentId={id}
        teacherId={teacherId}
        onSuccess={loadData}
      />
    </div>
  );
}
