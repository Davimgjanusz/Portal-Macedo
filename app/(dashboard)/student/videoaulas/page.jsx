'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Video, Play } from 'lucide-react';
import Card from '@/components/ui/Card';
<<<<<<< HEAD
=======
import Spinner from '@/components/ui/Spinner';
>>>>>>> master

export default function StudentVideoaulasPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('materiais')
        .select('*')
        .eq('tipo', 'video')
        .order('created_at', { ascending: false });

      setVideos(data || []);
      setLoading(false);
    }
    load();
  }, []);

  function getEmbedUrl(url) {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Video className="w-6 h-6" style={{ color: 'var(--primary)' }} />
        Videoaulas
      </h1>

      {loading ? (
<<<<<<< HEAD
        <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>Carregando...</p>
=======
        <Spinner />
>>>>>>> master
      ) : videos.length === 0 ? (
        <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
          Nenhuma videoaula disponível no momento.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Lista */}
          <div className="lg:col-span-1 space-y-2">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v)}
                className="w-full text-left rounded-xl border p-4 transition-shadow hover:shadow-md"
                style={{
                  background: selected?.id === v.id ? 'var(--primary)' : 'var(--card)',
                  color: selected?.id === v.id ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{v.titulo}</p>
                    {v.descricao && (
                      <p className="text-xs mt-0.5 truncate opacity-70">{v.descricao}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Player */}
          <div className="lg:col-span-2">
            {selected ? (
              <Card>
                <div className="aspect-video rounded-lg overflow-hidden mb-3" style={{ background: '#000' }}>
                  <iframe
                    src={getEmbedUrl(selected.url_storage_ou_embed)}
                    title={selected.titulo}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                <h3 className="font-semibold">{selected.titulo}</h3>
                {selected.descricao && (
                  <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{selected.descricao}</p>
                )}
              </Card>
            ) : (
              <Card>
                <p className="text-center py-16 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Selecione uma videoaula para assistir.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
