'use client';

<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
=======
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-toastify';
import { useDashboard } from '@/components/admin/useDashboard';
import { formatarIntervalo } from '@/lib/horarios';
>>>>>>> master
import {
  CalendarDays,
  Monitor,
  MapPin,
  BookOpen,
  FileText,
  CheckCircle,
  AlertCircle,
<<<<<<< HEAD
} from 'lucide-react';
import Card from '@/components/ui/Card';

export default function StudentHome() {
=======
  CreditCard,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

const dataCurta = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR');

function PayButton({ aulaId, onError }) {
  const [pending, setPending] = useState(false);

  async function pagar() {
    setPending(true);
    try {
      const res = await fetch('/api/pagamentos/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aula_id: aulaId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Não foi possível iniciar o pagamento');
      window.location.href = body.init_point;
    } catch (err) {
      onError(err.message);
      setPending(false);
    }
  }

  return (
    <Button size="sm" onClick={pagar} disabled={pending}>
      <CreditCard className="w-4 h-4" aria-hidden="true" />
      {pending ? 'Abrindo...' : 'Pagar'}
    </Button>
  );
}

export default function StudentHome() {
  const { user } = useDashboard();
  const searchParams = useSearchParams();
>>>>>>> master
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('aulas_registro')
        .select('*')
        .eq('student_id', user.id)
        .order('data_aula', { ascending: false })
        .limit(20);

=======
    const retorno = searchParams.get('pagamento');
    if (retorno === 'sucesso') toast.success('Pagamento recebido. A confirmação pode levar alguns instantes.');
    if (retorno === 'pendente') toast.info('Pagamento em análise. Atualizaremos o status assim que for aprovado.');
    if (retorno === 'falhou') toast.error('O pagamento não foi concluído. Você pode tentar novamente.');
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('aulas_registro')
        .select('id, data_aula, hora_inicio, hora_fim, modalidade, duracao_horas, conteudo_ensinado, teve_tarefa, descricao_tarefa, link_chamada, status_pagamento, valor_pago')
        .eq('student_id', user.id)
        .order('data_aula', { ascending: false })
        .limit(40);

      if (error) toast.error('Erro ao carregar suas aulas: ' + error.message);
>>>>>>> master
      setAulas(data || []);
      setLoading(false);
    }
    load();
<<<<<<< HEAD
  }, []);

  const proximas = aulas.filter((a) => new Date(a.data_aula) >= new Date(new Date().toDateString()));
  const tarefas = aulas.filter((a) => a.teve_tarefa);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Minha Área de Estudos</h1>

      {loading ? (
        <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>Carregando...</p>
      ) : (
        <>
          {/* Próximas Aulas */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              Próximas Aulas
            </h2>
            {proximas.length === 0 ? (
              <Card>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Nenhuma aula agendada.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {proximas.map((aula) => (
                  <Card key={aula.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {aula.modalidade === 'online' ? (
                          <Monitor className="w-4 h-4" style={{ color: '#06B6D4' }} />
                        ) : (
                          <MapPin className="w-4 h-4" style={{ color: '#F97316' }} />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(aula.data_aula + 'T12:00:00').toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            })}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {Number(aula.duracao_horas).toFixed(1)}h — {aula.modalidade}
                          </p>
                        </div>
                      </div>
                      {aula.link_chamada && (
                        <a
                          href={aula.link_chamada}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                        >
                          Entrar na Chamada
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Tarefas Pendentes */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: '#F59E0B' }} />
              Lições de Casa
            </h2>
            {tarefas.length === 0 ? (
              <Card>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Nenhuma lição de casa registrada.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {tarefas.slice(0, 10).map((aula) => (
                  <Card key={aula.id}>
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-4 h-4 mt-0.5" style={{ color: 'var(--primary)' }} />
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(aula.data_aula + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                          {aula.descricao_tarefa || 'Tarefa passada em aula'}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              Conteúdos Estudados
            </h2>
            <div className="space-y-2">
              {aulas.map((aula) => (
                <Card key={aula.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(aula.data_aula + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {aula.conteudo_ensinado}
                      </p>
                    </div>
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: aula.status_pagamento === 'pago' ? '#10B98120' : '#F59E0B20',
                        color: aula.status_pagamento === 'pago' ? '#10B981' : '#F59E0B',
                      }}
                    >
                      {aula.status_pagamento === 'pago' ? (
                        <><CheckCircle className="w-3 h-3" /> Pago</>
                      ) : (
                        <><AlertCircle className="w-3 h-3" /> Pendente</>
                      )}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
=======
  }, [user.id]);

  const hoje = new Date().toISOString().slice(0, 10);
  const proximas = useMemo(() => aulas.filter((a) => a.data_aula >= hoje), [aulas, hoje]);
  const tarefas = useMemo(() => aulas.filter((a) => a.teve_tarefa).slice(0, 10), [aulas]);
  const pendentes = useMemo(() => aulas.filter((a) => a.status_pagamento === 'pendente'), [aulas]);
  const totalPendente = useMemo(() => pendentes.reduce((s, a) => s + Number(a.valor_pago), 0), [pendentes]);

  if (loading) return <Spinner label="Carregando sua área de estudos" />;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Minha área de estudos</h1>

      {pendentes.length > 0 && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold">Pagamentos pendentes</p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {pendentes.length} {pendentes.length === 1 ? 'aula aguardando' : 'aulas aguardando'} pagamento · total R${' '}
                {totalPendente.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Use o botão “Pagar” em cada aula abaixo.
            </p>
          </div>
        </Card>
      )}

      <section aria-labelledby="proximas-aulas">
        <h2 id="proximas-aulas" className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CalendarDays className="w-5 h-5" style={{ color: 'var(--primary)' }} aria-hidden="true" />
          Próximas aulas
        </h2>
        {proximas.length === 0 ? (
          <Card>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Nenhuma aula agendada.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {proximas.map((aula) => (
              <Card key={aula.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {aula.modalidade === 'online' ? (
                      <Monitor className="w-4 h-4" style={{ color: '#06B6D4' }} aria-label="Online" />
                    ) : (
                      <MapPin className="w-4 h-4" style={{ color: '#F97316' }} aria-label="Presencial" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {new Date(aula.data_aula + 'T12:00:00').toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {formatarIntervalo(aula.hora_inicio, aula.hora_fim) || `${Number(aula.duracao_horas).toFixed(1)}h`} · {aula.modalidade}
                      </p>
                    </div>
                  </div>
                  {aula.link_chamada && (
                    <a
                      href={aula.link_chamada}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110"
                      style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                      Entrar na chamada
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="historico-aulas">
        <h2 id="historico-aulas" className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" style={{ color: 'var(--primary)' }} aria-hidden="true" />
          Histórico de aulas
        </h2>
        {aulas.length === 0 ? (
          <Card>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Nenhuma aula registrada ainda.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {aulas.map((aula) => {
              const pago = aula.status_pagamento === 'pago';
              return (
                <Card key={aula.id}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{dataCurta(aula.data_aula)}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                        {aula.conteudo_ensinado}
                      </p>
                      {aula.teve_tarefa && (
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                          <FileText className="w-3 h-3" aria-hidden="true" />
                          Lição: {aula.descricao_tarefa || 'sim'}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
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
                      <span className="text-sm font-medium">
                        R$ {Number(aula.valor_pago).toFixed(2).replace('.', ',')}
                      </span>
                      {!pago && <PayButton aulaId={aula.id} onError={(m) => toast.error(m)} />}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {tarefas.length > 0 && (
        <section aria-labelledby="licoes">
          <h2 id="licoes" className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: '#F59E0B' }} aria-hidden="true" />
            Lições de casa recentes
          </h2>
          <div className="space-y-2">
            {tarefas.map((aula) => (
              <Card key={aula.id}>
                <p className="text-sm font-medium">{dataCurta(aula.data_aula)}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {aula.descricao_tarefa || 'Tarefa passada em aula'}
                </p>
              </Card>
            ))}
          </div>
        </section>
>>>>>>> master
      )}
    </div>
  );
}
