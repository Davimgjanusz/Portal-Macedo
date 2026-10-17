'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { createClient } from '@/lib/supabase/client';
import { GraduationCap, LogIn } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      toast.success('Login realizado com sucesso!');
      router.push(profile?.role === 'teacher' ? '/admin' : '/student');
      router.refresh();
    } catch (err) {
      toast.error(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-grid-math flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm rounded-2xl border p-8 shadow-sm"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="text-center mb-6">
          <div
            className="inline-flex rounded-xl p-3 mb-3"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold">Portal Macedo</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Acesse sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          <Button type="submit" disabled={loading} className="w-full">
            <LogIn className="w-4 h-4" />
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </main>
  );
}
