'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Search, Plus, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import Spinner from '@/components/ui/Spinner';
import { maskTelefone } from '@/lib/masks';

const newStudentSchema = z.object({
  email: z.string().email('E-mail inválido'),
  nome: z.string().min(2, 'Nome é obrigatório'),
  telefone: z.string().optional(),
});

export default function AlunosPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [credenciais, setCredenciais] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(newStudentSchema) });

  async function loadStudents() {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, email, telefone')
      .eq('role', 'student')
      .eq('ativo', true)
      .order('nome');
    setStudents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.nome.toLowerCase().includes(search.toLowerCase()) ||
      s.telefone?.includes(search)
  );

  async function onCreateStudent(data) {
    try {
      const res = await fetch('/api/auth/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar aluno');
      }
      const dados = await res.json();
      setCredenciais({ nome: data.nome, email: data.email, senha: dados.senhaProvisoria });
      reset();
      setModalOpen(false);
      loadStudents();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Alunos</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Aluno
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <p className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
          {search ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado.'}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/admin/alunos/${s.id}`}
              className="rounded-xl border p-4 flex items-center gap-4 transition-shadow hover:shadow-md"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="rounded-full p-2.5" style={{ background: 'var(--muted)' }}>
                <User className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{s.nome}</p>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                  {s.email}
                </p>
                {s.telefone && (
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {s.telefone}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={!!credenciais} onClose={() => setCredenciais(null)} title="Senha provisória do aluno" size="sm">
        {credenciais && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Entregue ao aluno <strong style={{ color: 'var(--foreground)' }}>{credenciais.nome}</strong> ({credenciais.email}) a senha abaixo.
            </p>
            <p
              className="rounded-lg px-4 py-3 text-center font-mono text-lg tracking-wider select-all"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              {credenciais.senha}
            </p>
            <Button
              className="w-full"
              onClick={async () => {
                await navigator.clipboard.writeText(credenciais.senha);
                toast.success('Senha copiada');
              }}
            >
              Copiar senha
            </Button>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Esta senha não será exibida novamente. No primeiro acesso, o aluno precisará criar a própria senha.
            </p>
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Cadastrar Novo Aluno">
        <form onSubmit={handleSubmit(onCreateStudent)} className="space-y-4">
          <Input label="Nome Completo" {...register('nome')} error={errors.nome?.message} />
          <Input label="E-mail" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Telefone" type="tel" inputMode="tel" placeholder="(11) 99999-9999" mask={maskTelefone} {...register('telefone')} error={errors.telefone?.message} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Criando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
