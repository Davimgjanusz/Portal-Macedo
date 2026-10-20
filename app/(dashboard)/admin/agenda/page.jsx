'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-toastify';
import { useDashboard } from '@/components/admin/useDashboard';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import LessonDetailModal from '@/components/admin/LessonDetailModal';
import LessonRegistrationModal from '@/components/admin/LessonRegistrationModal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { Monitor, MapPin, Plus, ExternalLink, Pencil } from 'lucide-react';
import { formatarIntervalo } from '@/lib/horarios';
import { dataExtensa, hojeIso, intervaloDoMes } from '@/lib/calendario';

export default function AgendaPage() {
  const { user } = useDashboard();
  const agora = new Date();
  const [ano, setAno] = useState(agora.getFullYear());
  const [mes, setMes] = useState(agora.getMonth());
  const [dia, setDia] = useState(hojeIso());
  const [aulas, setAulas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [students, setStudents] = useState([]);
  const [detalhe, setDetalhe] = useState(null);
  const [detalheAberto, setDetalheAberto] = useState(false);
  const [registroAberto, setRegistroAberto] = useState(false);

  const carregarAulas = useCallback(async () => {
    setCarregando(true);
    const { inicio, fim } = intervaloDoMes(ano, mes);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('aulas_registro')
      .select(
        'id, data_aula, hora_inicio, hora_fim, duracao_horas, modalidade, endereco, status_pagamento, valor_pago, conteudo_ensinado, teve_tarefa, descricao_tarefa, link_chamada, student_id, profiles!aulas_registro_student_id_fkey(nome)'
      )
      .gte('data_aula', inicio)
      .lte('data_aula', fim)
      .order('data_aula')
      .order('hora_inicio', { nullsFirst: true });

    if (error) toast.error('Erro ao carregar a agenda: ' + error.message);
    setAulas(data || []);
    setCarregando(false);
  }, [ano, mes]);

  useEffect(() => {
    carregarAulas();
  }, [carregarAulas]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('id, nome')
      .eq('role', 'student')
      .eq('ativo', true)
      .order('nome')
      .then(({ data }) => setStudents(data || []));
  }, []);

  function navegar(delta) {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes < 0) {
      novoMes = 11;
      novoAno -= 1;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno += 1;
    }
    setMes(novoMes);
    setAno(novoAno);
  }

  function irParaHoje() {
    const h = new Date();
    setAno(h.getFullYear());
    setMes(h.getMonth());
    setDia(hojeIso());
  }

  function aoAlterarAula(atualizada) {
    setAulas((prev) => prev.map((a) => (a.id === atualizada.id ? { ...a, ...atualizada } : a)));
  }

  const aulasDoDia = useMemo(
    () =>
      aulas
        .filter((a) => a.data_aula === dia)
        .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || '')),
    [aulas, dia]
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Agenda</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        <MonthCalendar
          ano={ano}
          mes={mes}
          onNavegar={navegar}
          onHoje={irParaHoje}
          aulas={aulas}
          diaSelecionado={dia}
          onSelecionarDia={setDia}
        />

        <section aria-labelledby="dia-titulo">
          <Card>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h2 id="dia-titulo" className="font-semibold capitalize">{dataExtensa(dia)}</h2>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {aulasDoDia.length} {aulasDoDia.length === 1 ? 'aula' : 'aulas'}
                </p>
              </div>
              <Button size="sm" onClick={() => setRegistroAberto(true)}>
                <Plus className="w-4 h-4" aria-hidden="true" /> Aula
              </Button>
            </div>

            {carregando ? (
              <Spinner label="Carregando aulas" />
            ) : aulasDoDia.length === 0 ? (
              <p className="text-sm py-6 text-center" style={{ color: 'var(--muted-foreground)' }}>
                Nenhuma aula neste dia.
              </p>
            ) : (
              <ul className="space-y-2">
                {aulasDoDia.map((a) => {
                  const pago = a.status_pagamento === 'pago';
                  return (
                    <li key={a.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {formatarIntervalo(a.hora_inicio, a.hora_fim) || `${Number(a.duracao_horas).toFixed(1)}h`}
                          </p>
                          <Link href={`/admin/alunos/${a.student_id}`} className="text-sm font-medium hover:underline truncate block">
                            {a.profiles?.nome}
                          </Link>
                          <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                            {a.conteudo_ensinado}
                          </p>
                          {a.modalidade === 'presencial' && a.endereco && (
                            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                              {a.endereco}
                            </p>
                          )}
                        </div>
                        <span
                          className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: pago ? '#10B98120' : '#F59E0B20', color: pago ? '#0F8A5F' : '#B45309' }}
                        >
                          {pago ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="flex items-center gap-1">
                          {a.modalidade === 'online' ? <Monitor className="w-3.5 h-3.5" aria-hidden="true" /> : <MapPin className="w-3.5 h-3.5" aria-hidden="true" />}
                          {a.modalidade === 'online' ? 'Online' : 'Presencial'}
                        </span>
                        <div className="flex items-center gap-3">
                          {a.link_chamada && (
                            <a href={a.link_chamada} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" /> Entrar
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setDetalhe(a);
                              setDetalheAberto(true);
                            }}
                            aria-label={`Editar aula de ${a.profiles?.nome}`}
                            className="flex items-center gap-1 font-medium hover:underline"
                            style={{ color: 'var(--primary)' }}
                          >
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Editar
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>
      </div>

      <LessonDetailModal
        aula={detalhe}
        open={detalheAberto}
        onClose={() => setDetalheAberto(false)}
        onChanged={aoAlterarAula}
      />

      <LessonRegistrationModal
        open={registroAberto}
        onClose={() => setRegistroAberto(false)}
        students={students}
        dataInicial={dia}
        teacherId={user.id}
        onSuccess={carregarAulas}
      />
    </div>
  );
}
