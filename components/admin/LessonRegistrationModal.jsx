'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { createClient } from '@/lib/supabase/client';
import { duracaoEmHoras } from '@/lib/horarios';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Save } from 'lucide-react';

const TAXA_HORA = 40;
const TAXA_TRANSPORTE = 13;

const schema = z
  .object({
    data_aula: z.string().min(1, 'Data é obrigatória'),
    hora_inicio: z.string().min(1, 'Informe o horário de início'),
    hora_fim: z.string().min(1, 'Informe o horário de término'),
    modalidade: z.enum(['online', 'presencial']),
    conteudo_ensinado: z.string().min(3, 'Descreva o conteúdo'),
    teve_tarefa: z.boolean(),
    descricao_tarefa: z.string().optional(),
    endereco: z.string().optional(),
    status_pagamento: z.enum(['pago', 'pendente']),
  })
  .superRefine((d, ctx) => {
    const duracao = duracaoEmHoras(d.hora_inicio, d.hora_fim);
    if (duracao === null) {
      ctx.addIssue({ code: 'custom', path: ['hora_fim'], message: 'O término deve ser depois do início' });
    } else if (duracao < 0.5) {
      ctx.addIssue({ code: 'custom', path: ['hora_fim'], message: 'A aula deve ter no mínimo 30 minutos' });
    } else if (duracao > 8) {
      ctx.addIssue({ code: 'custom', path: ['hora_fim'], message: 'A aula deve ter no máximo 8 horas' });
    }
    if (d.modalidade === 'presencial' && !d.endereco?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['endereco'], message: 'Informe o endereço da aula presencial' });
    }
  });

function valoresIniciais(dataInicial) {
  return {
    student_id: '',
    data_aula: dataInicial || new Date().toISOString().split('T')[0],
    hora_inicio: '14:00',
    hora_fim: '15:00',
    modalidade: 'online',
    conteudo_ensinado: '',
    teve_tarefa: false,
    descricao_tarefa: '',
    endereco: '',
    status_pagamento: 'pendente',
  };
}

export default function LessonRegistrationModal({ open, onClose, studentId, students, dataInicial, teacherId, onSuccess }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais(dataInicial),
  });

  useEffect(() => {
    if (open) reset(valoresIniciais(dataInicial));
  }, [open, dataInicial, reset]);

  const [modalidade, inicio, fim, teveTarefa] = useWatch({
    control,
    name: ['modalidade', 'hora_inicio', 'hora_fim', 'teve_tarefa'],
  });

  const horas = duracaoEmHoras(inicio, fim) ?? 0;
  const isPresencial = modalidade === 'presencial';
  const transporte = isPresencial ? TAXA_TRANSPORTE : 0;
  const valorTotal = horas * TAXA_HORA + transporte;

  async function onSubmit(data) {
    const alunoId = studentId || data.student_id;
    if (!alunoId) {
      toast.error('Escolha o aluno da aula.');
      return;
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.from('aulas_registro').insert({
        teacher_id: teacherId,
        student_id: alunoId,
        data_aula: data.data_aula,
        hora_inicio: data.hora_inicio,
        hora_fim: data.hora_fim,
        duracao_horas: duracaoEmHoras(data.hora_inicio, data.hora_fim),
        modalidade: data.modalidade,
        endereco: data.modalidade === 'presencial' ? data.endereco.trim() : null,
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
    <Modal open={open} onClose={onClose} title="Registrar nova aula" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {students && (
          <Select label="Aluno" {...register('student_id')}>
            <option value="">Selecione o aluno</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </Select>
        )}

        <Input label="Data" type="date" {...register('data_aula')} error={errors.data_aula?.message} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Início" type="time" {...register('hora_inicio')} error={errors.hora_inicio?.message} />
          <Input label="Término" type="time" {...register('hora_fim')} error={errors.hora_fim?.message} />
        </div>

        <Select label="Modalidade" {...register('modalidade')} error={errors.modalidade?.message}>
          <option value="online">Por chamada (online)</option>
          <option value="presencial">Presencial</option>
        </Select>

        {isPresencial && (
          <Input
            label="Endereço da aula"
            placeholder="Rua, número, bairro, cidade"
            autoComplete="street-address"
            {...register('endereco')}
            error={errors.endereco?.message}
          />
        )}

        <p className="rounded-lg px-4 py-3 text-sm font-medium" style={{ background: 'var(--muted)', color: 'var(--primary)' }}>
          {horas > 0 ? `${horas.toFixed(2).replace(/\.?0+$/, '')}h` : 'Duração inválida'} · Valor: R$ {valorTotal.toFixed(2).replace('.', ',')}
          <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>
            ({horas}h × R$40{isPresencial ? ' + R$13 transporte' : ''})
          </span>
        </p>

        <div>
          <label htmlFor="conteudo_ensinado" className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Conteúdo ensinado</label>
          <textarea
            id="conteudo_ensinado"
            rows={3}
            placeholder="Ex: Equações do 2º grau, Bhaskara..."
            aria-invalid={errors.conteudo_ensinado ? 'true' : undefined}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
            style={{ background: 'var(--card)', borderColor: errors.conteudo_ensinado ? '#EF4444' : 'var(--border)', color: 'var(--foreground)' }}
            {...register('conteudo_ensinado')}
          />
          {errors.conteudo_ensinado && <p role="alert" className="mt-1 text-xs text-red-500">{errors.conteudo_ensinado.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="teve_tarefa" {...register('teve_tarefa')} className="rounded" />
          <label htmlFor="teve_tarefa" className="text-sm">Passou lição de casa?</label>
        </div>

        {teveTarefa && (
          <Input label="Descrição da lição" placeholder="Exercícios pg. 45-48" {...register('descricao_tarefa')} />
        )}

        <Select label="Status do pagamento" {...register('status_pagamento')} error={errors.status_pagamento?.message}>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
        </Select>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            <Save className="w-4 h-4" aria-hidden="true" />
            {isSubmitting ? 'Salvando...' : 'Registrar aula'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
