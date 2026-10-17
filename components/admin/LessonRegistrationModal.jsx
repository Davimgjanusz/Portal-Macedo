'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { createClient } from '@/lib/supabase/client';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Save } from 'lucide-react';

const TAXA_HORA = 40;
const TAXA_TRANSPORTE = 13;

const schema = z.object({
  data_aula: z.string().min(1, 'Data é obrigatória'),
  duracao_horas: z.coerce.number().min(0.5, 'Mínimo 0.5h').max(8, 'Máximo 8h'),
  modalidade: z.enum(['online', 'presencial']),
  conteudo_ensinado: z.string().min(3, 'Descreva o conteúdo'),
  teve_tarefa: z.boolean().default(false),
  descricao_tarefa: z.string().optional(),
  status_pagamento: z.enum(['pago', 'pendente']),
});

export default function LessonRegistrationModal({ open, onClose, studentId, teacherId, onSuccess }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      data_aula: new Date().toISOString().split('T')[0],
      duracao_horas: 1,
      modalidade: 'online',
      conteudo_ensinado: '',
      teve_tarefa: false,
      descricao_tarefa: '',
      status_pagamento: 'pendente',
    },
  });

  const modalidade = watch('modalidade');
  const horas = watch('duracao_horas');
  const teveTarefa = watch('teve_tarefa');

  const isPresencial = modalidade === 'presencial';
  const transporte = isPresencial ? TAXA_TRANSPORTE : 0;
  const valorTotal = (Number(horas) || 0) * TAXA_HORA + transporte;

  async function onSubmit(data) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('aulas_registro').insert({
        teacher_id: teacherId,
        student_id: studentId,
        data_aula: data.data_aula,
        duracao_horas: data.duracao_horas,
        modalidade: data.modalidade,
        taxa_transporte: transporte,
        valor_pago: valorTotal,
        status_pagamento: data.status_pagamento,
        conteudo_ensinado: data.conteudo_ensinado,
        teve_tarefa: data.teve_tarefa,
        descricao_tarefa: data.teve_tarefa ? data.descricao_tarefa : null,
      });

      if (error) throw error;

      toast.success('Aula registrada com sucesso!');
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(`Erro ao registrar aula: ${err.message}`);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar Nova Aula">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Data" type="date" {...register('data_aula')} error={errors.data_aula?.message} />
          <Input label="Duração (horas)" type="number" step="0.5" min="0.5" max="8" {...register('duracao_horas')} error={errors.duracao_horas?.message} />
        </div>

        <Select label="Modalidade" {...register('modalidade')} error={errors.modalidade?.message}>
          <option value="online">Por Chamada (Online)</option>
          <option value="presencial">Presencial</option>
        </Select>

        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{ background: 'var(--muted)', color: 'var(--primary)' }}
        >
          Valor: R$ {valorTotal.toFixed(2).replace('.', ',')}
          <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>
            ({horas}h × R$40{isPresencial ? ' + R$13 transporte' : ''})
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Conteúdo Ensinado</label>
          <textarea
            rows={3}
            placeholder="Ex: Equações do 2º grau, Bhaskara..."
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
            style={{ background: 'var(--card)', borderColor: errors.conteudo_ensinado ? '#EF4444' : 'var(--border)', color: 'var(--foreground)' }}
            {...register('conteudo_ensinado')}
          />
          {errors.conteudo_ensinado && <p className="mt-1 text-xs text-red-500">{errors.conteudo_ensinado.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="teve_tarefa" {...register('teve_tarefa')} className="rounded" />
          <label htmlFor="teve_tarefa" className="text-sm">Passou lição de casa?</label>
        </div>

        {teveTarefa && (
          <Input label="Descrição da Tarefa" placeholder="Exercícios pg. 45-48" {...register('descricao_tarefa')} />
        )}

        <Select label="Status do Pagamento" {...register('status_pagamento')} error={errors.status_pagamento?.message}>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
        </Select>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Salvando...' : 'Registrar Aula'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
