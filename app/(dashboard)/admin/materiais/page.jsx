'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Upload, FileText, Video, BookOpen, Trash2, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

const schema = z.object({
  titulo: z.string().min(2, 'Título é obrigatório'),
  descricao: z.string().optional(),
  tipo: z.enum(['pdf', 'video', 'exercicio']),
  url_ou_arquivo: z.string().optional(),
});

const typeIcons = { pdf: FileText, video: Video, exercicio: BookOpen };

export default function MateriaisPage() {
  const [materiais, setMateriais] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'pdf' },
  });

  const tipo = watch('tipo');

  async function loadData() {
    const supabase = createClient();
    const [{ data: mat }, { data: stu }] = await Promise.all([
      supabase.from('materiais').select('*, profiles!materiais_student_id_fkey(nome)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, nome').eq('role', 'student').eq('ativo', true).order('nome'),
    ]);
    setMateriais(mat || []);
    setStudents(stu || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onSubmit(data) {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let url = data.url_ou_arquivo || '';

      if (file && data.tipo === 'pdf') {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('materiais')
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('materiais').getPublicUrl(fileName);
        url = urlData.publicUrl;
      }

      const { error } = await supabase.from('materiais').insert({
        teacher_id: user.id,
        titulo: data.titulo,
        descricao: data.descricao || null,
        tipo: data.tipo,
        url_storage_ou_embed: url,
        student_id: selectedStudent || null,
      });

      if (error) throw error;
      toast.success('Material adicionado!');
      reset();
      setFile(null);
      setSelectedStudent('');
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteMaterial(matId) {
    if (!confirm('Remover este material?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('materiais').delete().eq('id', matId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Material removido');
      loadData();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Materiais Didáticos</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Novo Material
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : materiais.length === 0 ? (
        <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>Nenhum material cadastrado.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {materiais.map((m) => {
            const Icon = typeIcons[m.tipo] || FileText;
            return (
              <Card key={m.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="font-medium text-sm">{m.titulo}</p>
                      {m.descricao && (
                        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{m.descricao}</p>
                      )}
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        {m.profiles?.nome || 'Todos os alunos'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteMaterial(m.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Adicionar Material">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Título" {...register('titulo')} error={errors.titulo?.message} />
          <Input label="Descrição (opcional)" {...register('descricao')} />
          <Select label="Tipo" {...register('tipo')} error={errors.tipo?.message}>
            <option value="pdf">PDF</option>
            <option value="video">Videoaula</option>
            <option value="exercicio">Exercício</option>
          </Select>

          {tipo === 'pdf' ? (
            <div>
              <label className="block text-sm font-medium mb-1">Arquivo PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
            </div>
          ) : (
            <Input label="URL (embed ou link)" {...register('url_ou_arquivo')} placeholder="https://..." />
          )}

          <Select
            label="Atribuir a aluno (opcional)"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Todos os alunos</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </Select>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Upload className="w-4 h-4" />
              {isSubmitting ? 'Enviando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
