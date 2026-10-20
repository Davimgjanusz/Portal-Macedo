'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileText, Download, BookOpen } from 'lucide-react';
import Card from '@/components/ui/Card';
<<<<<<< HEAD
=======
import Spinner from '@/components/ui/Spinner';
>>>>>>> master

export default function StudentMateriaisPage() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('materiais')
        .select('*')
        .in('tipo', ['pdf', 'exercicio'])
        .order('created_at', { ascending: false });

      setMateriais(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BookOpen className="w-6 h-6" style={{ color: 'var(--primary)' }} />
        Materiais Didáticos
      </h1>

      {loading ? (
<<<<<<< HEAD
        <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>Carregando...</p>
=======
        <Spinner />
>>>>>>> master
      ) : materiais.length === 0 ? (
        <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
          Nenhum material disponível no momento.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {materiais.map((m) => (
            <Card key={m.id}>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 mt-0.5" style={{ color: 'var(--primary)' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{m.titulo}</p>
                  {m.descricao && (
                    <p className="text-xs mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {m.descricao}
                    </p>
                  )}
                  <a
                    href={m.url_storage_ou_embed}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium"
                    style={{ color: 'var(--primary)' }}
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
