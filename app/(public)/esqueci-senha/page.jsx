'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});

export default function EsqueciSenhaPage() {
  const [enviado, setEnviado] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit({ email }) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/definir-senha`,
    });
    if (error) {
      toast.error('Não foi possível enviar o e-mail. Tente novamente em instantes.');
      return;
    }
    setEnviado(true);
  }

  return (
    <main
      id="conteudo"
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, var(--hero-from), var(--hero-to))' }}
    >
      <div className="w-full max-w-sm rounded-2xl border p-8 shadow-xl" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h1 className="font-display text-xl font-bold mb-2">Recuperar senha</h1>

        {enviado ? (
          <div role="status" className="space-y-4">
            <div className="inline-flex rounded-xl p-3" style={{ background: 'var(--muted)', color: 'var(--primary)' }}>
              <Mail className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Se existir uma conta para <strong style={{ color: 'var(--foreground)' }}>{getValues('email')}</strong>,
              você receberá um e-mail com o link para criar uma nova senha. Verifique também a caixa de spam.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="E-mail"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register('email')}
                error={errors.email?.message}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Enviando...' : 'Enviar link'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Voltar ao login
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
