'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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

export default function DefinirSenhaPage() {
  const [estado, setEstado] = useState('verificando');
  const [conta, setConta] = useState(null);
  const iniciado = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const senhaAtual = watch('password');

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;

    async function iniciar() {
      const supabase = createClient();
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const code = url.searchParams.get('code');
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      const tipo = hash.get('type');

      let user = null;
      try {
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          user = data.user;
        } else if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          user = data.user;
        }
      } catch {
        user = null;
      }

      window.history.replaceState(null, '', '/definir-senha');

      if (!user) {
        setEstado('invalido');
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('role, nome').eq('id', user.id).single();

      if (tipo === 'invite' && profile?.role !== 'student') {
        await supabase.auth.signOut();
        setEstado('invalido');
        return;
      }

      setConta({ email: user.email, nome: profile?.nome, role: profile?.role });
      setEstado('pronto');
    }

    iniciar();
  }, []);

  async function onSubmit({ password }) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Senha definida com sucesso!');
    window.location.assign(conta?.role === 'teacher' ? '/admin' : '/student');
  }

  return (
    <main
      id="conteudo"
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, var(--hero-from), var(--hero-to))' }}
    >
      <div className="w-full max-w-md rounded-2xl border p-8 shadow-xl" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {estado === 'verificando' && <Spinner label="Verificando link" />}

        {estado === 'invalido' && (
          <div role="alert" className="space-y-4">
            <h1 className="font-display text-xl font-bold">Link inválido ou expirado</h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Este link já foi usado, expirou ou não é válido para esta conta. Solicite um novo link para continuar.
            </p>
            <Link href="/esqueci-senha" className="inline-block text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
              Solicitar novo link
            </Link>
          </div>
        )}

        {estado === 'pronto' && (
          <>
            <div className="inline-flex rounded-xl p-3 mb-4" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              <KeyRound className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="font-display text-xl font-bold mb-1">Crie sua senha</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Você está criando a senha da conta <strong style={{ color: 'var(--foreground)' }}>{conta.email}</strong>.
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
                {isSubmitting ? 'Salvando...' : 'Salvar senha'}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
