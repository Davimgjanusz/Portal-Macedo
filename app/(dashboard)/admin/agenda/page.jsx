'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CalendarDays, Monitor, MapPin, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function AgendaPage() {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const { data } = await supabase
        .from('aulas_registro')
        .select('*, profiles!aulas_registro_student_id_fkey(nome)')
        .gte('data_aula', today)
        .lte('data_aula', nextWeek)
        .order('data_aula');

      setAulas(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const grouped = aulas.reduce((acc, aula) => {
    const key = aula.data_aula;
    if (!acc[key]) acc[key] = [];
    acc[key].push(aula);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="w-6 h-6" style={{ color: 'var(--primary)' }} />
        <h1 className="text-2xl font-bold">Agenda da Semana</h1>
      </div>

      {loading ? (
        <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>Carregando...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
          Nenhuma aula agendada para os próximos 7 dias.
        </p>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>
              {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>
            <div className="space-y-2">
              {items.map((aula) => (
                <Card key={aula.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {aula.modalidade === 'online' ? (
                        <Monitor className="w-4 h-4" style={{ color: '#06B6D4' }} />
                      ) : (
                        <MapPin className="w-4 h-4" style={{ color: '#F97316' }} />
                      )}
                      <div>
                        <p className="font-medium text-sm">{aula.profiles?.nome}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {aula.conteudo_ensinado}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <Clock className="w-3.5 h-3.5" />
                      {Number(aula.duracao_horas).toFixed(1)}h
                      {aula.link_chamada && (
                        <a
                          href={aula.link_chamada}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 px-2 py-1 rounded text-xs font-medium"
                          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                        >
                          Entrar
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
