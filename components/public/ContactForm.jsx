'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Send, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { maskTelefone } from '@/lib/masks';

const schema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  mensagem: z.string().min(10, 'Mensagem deve ter ao menos 10 caracteres'),
});

const WHATSAPP_NUMBER = '5511999999999';

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    const text = `Olá Professor Macedo! Meu nome é ${data.nome}.\n\nE-mail: ${data.email}\nTelefone: ${data.telefone}\n\nMensagem:\n${data.mensagem}`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    toast.success('Redirecionando para o WhatsApp...');
    reset();
  }

  return (
    <section id="contato" className="w-full max-w-xl mx-auto px-4">
      <div
        className="rounded-2xl border p-6 sm:p-8 shadow-sm"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
      >
        <h3 className="text-xl font-bold mb-2">Entre em Contato</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
          Preencha o formulário e você será redirecionado para o WhatsApp.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome" placeholder="Seu nome completo" {...register('nome')} error={errors.nome?.message} />
          <Input label="E-mail" type="email" placeholder="seu@email.com" {...register('email')} error={errors.email?.message} />
          <Input label="Telefone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" mask={maskTelefone} {...register('telefone')} error={errors.telefone?.message} />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Mensagem</label>
            <textarea
              rows={4}
              placeholder="Como posso ajudar?"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--primary)] resize-none"
              style={{ background: 'var(--card)', borderColor: errors.mensagem ? '#EF4444' : 'var(--border)', color: 'var(--foreground)' }}
              {...register('mensagem')}
            />
            {errors.mensagem && <p className="mt-1 text-xs text-red-500">{errors.mensagem.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <MessageCircle className="w-4 h-4" />
            {isSubmitting ? 'Enviando...' : 'Enviar via WhatsApp'}
          </Button>
        </form>
      </div>
    </section>
  );
}
