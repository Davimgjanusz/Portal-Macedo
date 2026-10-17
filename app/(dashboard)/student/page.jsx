'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  CalendarDays,
  Monitor,
  MapPin,
  BookOpen,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Card from '@/components/ui/Card';

export default function StudentHome() {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

      setAulas(data || []);
      setLoading(false);
    }
    load();
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
      )}
    </div>
  );
}
