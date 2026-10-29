'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { createClient } from '@/lib/supabase/client';
import { checarSenha } from '@/lib/password';
import { CheckCircle2, KeyRound } from 'lucide-react';
import Button from '@/components/ui/Button';
import PasswordInput from '@/components/ui/PasswordInput';
import PasswordStrength from '@/components/ui/PasswordStrength';
import Spinner from '@/components/ui/Spinner';

const schema = z
  .object({
    password: z.string(),
    confirmacao: z.string(),
  })
  .superRefine((d, ctx) => {
    if (!checarSenha(d.password).ok) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'A senha não atende aos requisitos abaixo' });
    }
    if (d.password !== d.confirmacao) {
      ctx.addIssue({ code: 'custom', path: ['confirmacao'], message: 'As senhas não coincidem' });
    }
  });

export default function AlterarSenhaPage() {
  const router = useRouter();
  const [conta, setConta] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const senhaAtual = watch('password');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('role, nome').eq('id', user.id).single();
      setConta({ email: user.email, role: profile?.role, nome: profile?.nome });
    });
  }, [router]);

  async function onSubmit({ password }) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
      data: { senha_provisoria: false },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Senha criada com sucesso!');
    window.location.assign(conta?.role === 'teacher' ? '/admin' : '/student');
  }

  if (!conta) {
    return (
      <main id="conteudo" className="min-h-screen flex items-center justify-center">
        <Spinner label="Carregando sua conta" />
      </main>
    );
  }

  return (
    <main
      id="conteudo"
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, var(--hero-from), var(--hero-to))' }}
    >
      <div className="w-full max-w-md rounded-2xl border p-8 shadow-xl" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="inline-flex rounded-xl p-3 mb-4" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          <KeyRound className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-xl font-bold mb-1">Crie sua senha pessoal</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
          Olá, {conta.nome}. Você entrou com uma senha provisória. Para continuar, crie uma senha só sua para a conta{' '}
          <strong style={{ color: 'var(--foreground)' }}>{conta.email}</strong>.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <PasswordInput
            label="Nova senha"
            autoComplete="new-password"
            {...register('password')}
            error={errors.password?.message}
          />
          <PasswordStrength password={senhaAtual} email={conta.email} />
          <PasswordInput
            label="Confirmar senha"
            autoComplete="new-password"
            {...register('confirmacao')}
            error={errors.confirmacao?.message}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            {isSubmitting ? 'Salvando...' : 'Salvar e continuar'}
          </Button>
        </form>
      </div>
    </main>
  );
}
