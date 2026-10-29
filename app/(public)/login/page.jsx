'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { createClient } from '@/lib/supabase/client';
import { GraduationCap, LogIn } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    const erro = new URLSearchParams(window.location.search).get('erro');
    if (erro === 'google') toast.error('Não foi possível entrar com o Google. Tente novamente.');
    if (erro === 'conta-nao-cadastrada') {
      toast.error('Esta conta Google não está cadastrada no portal. Fale com o professor.');
    }
  }, []);

  async function entrarComGoogle() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  }

  async function onSubmit(data) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: auth, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', auth.user.id)
        .single();

      // Navegação completa: o cache do roteador pode guardar o redirecionamento de quando não havia sessão
      window.location.assign(profile?.role === 'teacher' ? '/admin' : '/student');
    } catch (err) {
      const mensagem =
        err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message;
      toast.error(mensagem || 'Erro ao fazer login');
      setLoading(false);
    }
  }

  return (
    <main
      id="conteudo"
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, var(--hero-from), var(--hero-to))' }}
    >
      <div className="w-full max-w-sm rounded-2xl border p-8 shadow-xl" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="text-center mb-8">
          <div className="inline-flex rounded-xl p-3 mb-3" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            <GraduationCap className="w-8 h-8" aria-hidden="true" />
          </div>
          <h1 className="font-display text-xl font-bold">Portal Macedo</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Acesse sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <PasswordInput
            label="Senha"
            autoComplete="current-password"
            placeholder="Sua senha"
            {...register('password')}
            error={errors.password?.message}
          />
          <div className="flex justify-end">
            <Link href="/esqueci-senha" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
              Esqueci minha senha
            </Link>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            <LogIn className="w-4 h-4" aria-hidden="true" />
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-5" aria-hidden="true">
          <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>ou</span>
          <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
        </div>

        <Button type="button" variant="secondary" onClick={entrarComGoogle} className="w-full">
          <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Entrar com Google
        </Button>
      </div>
    </main>
  );
}
