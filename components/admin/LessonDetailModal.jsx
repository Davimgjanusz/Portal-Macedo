'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-toastify';
import { Monitor, MapPin, Clock, DollarSign, FileText, BookOpen, Pencil, Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { duracaoEmHoras, formatarIntervalo } from '@/lib/horarios';

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

const brl = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

function valoresDe(aula) {
  return {
    data_aula: aula.data_aula,
    hora_inicio: aula.hora_inicio ? aula.hora_inicio.slice(0, 5) : '',
    hora_fim: aula.hora_fim ? aula.hora_fim.slice(0, 5) : '',
    modalidade: aula.modalidade,
    conteudo_ensinado: aula.conteudo_ensinado,
    teve_tarefa: !!aula.teve_tarefa,
    descricao_tarefa: aula.descricao_tarefa || '',
    endereco: aula.endereco || '',
    status_pagamento: aula.status_pagamento,
  };
}

export default function LessonDetailModal({ aula, open, onClose, onChanged }) {
  const [editando, setEditando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (aula) reset(valoresDe(aula));
    setEditando(false);
  }, [aula, reset]);

  useEffect(() => {
    if (!open) setEditando(false);
  }, [open]);

  const modalidade = watch('modalidade');
  const horas = duracaoEmHoras(watch('hora_inicio'), watch('hora_fim')) ?? 0;
  const teveTarefa = watch('teve_tarefa');
  const transporte = modalidade === 'presencial' ? TAXA_TRANSPORTE : 0;
  const valorCalculado = horas * TAXA_HORA + transporte;

  async function salvar(dados) {
    const supabase = createClient();
    const duracao = duracaoEmHoras(dados.hora_inicio, dados.hora_fim);
    const { error } = await supabase
      .from('aulas_registro')
      .update({
        data_aula: dados.data_aula,
        hora_inicio: dados.hora_inicio,
        hora_fim: dados.hora_fim,
        duracao_horas: duracao,
        modalidade: dados.modalidade,
        taxa_transporte: transporte,
        valor_pago: valorCalculado,
        conteudo_ensinado: dados.conteudo_ensinado,
        teve_tarefa: dados.teve_tarefa,
        descricao_tarefa: dados.teve_tarefa ? dados.descricao_tarefa || null : null,
        endereco: dados.modalidade === 'presencial' ? dados.endereco.trim() : null,
        status_pagamento: dados.status_pagamento,
      })
      .eq('id', aula.id);

    if (error) {
      toast.error('Não foi possível salvar: ' + error.message);
      return;
    }

    toast.success('Aula atualizada');
    onChanged?.({
      ...aula,
      ...dados,
      hora_inicio: dados.hora_inicio,
      hora_fim: dados.hora_fim,
      duracao_horas: duracao,
      endereco: dados.modalidade === 'presencial' ? dados.endereco.trim() : null,
      taxa_transporte: transporte,
      valor_pago: valorCalculado,
      descricao_tarefa: dados.teve_tarefa ? dados.descricao_tarefa || null : null,
    });
    setEditando(false);
  }

  if (!aula) return <Modal open={false} onClose={onClose} title="Aula" />;

  const pago = aula.status_pagamento === 'pago';
  const dataExtenso = new Date(aula.data_aula + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (editando) {
    return (
      <Modal open={open} onClose={onClose} title="Editar aula" size="lg">
        <form onSubmit={handleSubmit(salvar)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data" type="date" {...register('data_aula')} error={errors.data_aula?.message} />
            <Input label="Início" type="time" {...register('hora_inicio')} error={errors.hora_inicio?.message} />
            <Input label="Término" type="time" {...register('hora_fim')} error={errors.hora_fim?.message} />
          </div>

          <Select label="Modalidade" {...register('modalidade')} error={errors.modalidade?.message}>
            <option value="online">Por chamada (online)</option>
            <option value="presencial">Presencial</option>
          </Select>

          {modalidade === 'presencial' && (
            <Input
              label="Endereço da aula"
              placeholder="Rua, número, bairro, cidade"
              {...register('endereco')}
              error={errors.endereco?.message}
            />
          )}

          <p className="rounded-lg px-4 py-3 text-sm font-medium" style={{ background: 'var(--muted)', color: 'var(--primary)' }}>
            Valor recalculado: {brl(valorCalculado)}
            <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>
              ({horas}h × R$40{transporte ? ' + R$13 transporte' : ''})
            </span>
          </p>

          <div>
            <label htmlFor="conteudo" className="block text-sm font-medium mb-1">Conteúdo ensinado</label>
            <textarea
              id="conteudo"
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              style={{ background: 'var(--card)', borderColor: errors.conteudo_ensinado ? '#EF4444' : 'var(--border)', color: 'var(--foreground)' }}
              aria-invalid={errors.conteudo_ensinado ? 'true' : undefined}
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
            <Button type="button" variant="secondary" onClick={() => { reset(valoresDe(aula)); setEditando(false); }} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isDirty} className="flex-1">
              <Save className="w-4 h-4" aria-hidden="true" />
              {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Detalhes da aula" size="lg">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold capitalize">{dataExtenso}</p>
            <p className="text-sm flex items-center gap-2 mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {aula.modalidade === 'online' ? <Monitor className="w-4 h-4" aria-hidden="true" /> : <MapPin className="w-4 h-4" aria-hidden="true" />}
              {aula.modalidade === 'online' ? 'Online' : 'Presencial'}
            </p>
            {aula.modalidade === 'presencial' && aula.endereco && (
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{aula.endereco}</p>
            )}
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: pago ? '#10B98120' : '#F59E0B20', color: pago ? '#0F8A5F' : '#B45309' }}
          >
            {pago ? 'Pago' : 'Pendente'}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
              <Clock className="w-3.5 h-3.5" aria-hidden="true" /> Horário
            </dt>
            <dd className="font-medium">
              {formatarIntervalo(aula.hora_inicio, aula.hora_fim) || '—'}
              <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}> · {Number(aula.duracao_horas).toFixed(2).replace(/\.?0+$/, '')}h</span>
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
              <DollarSign className="w-3.5 h-3.5" aria-hidden="true" /> Valor
            </dt>
            <dd className="font-medium">{brl(aula.valor_pago)}</dd>
          </div>
        </dl>

        <div className="text-sm">
          <p className="flex items-center gap-1 mb-1" style={{ color: 'var(--muted-foreground)' }}>
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Conteúdo ensinado
          </p>
          <p>{aula.conteudo_ensinado}</p>
        </div>

        {aula.teve_tarefa && (
          <div className="text-sm">
            <p className="flex items-center gap-1 mb-1" style={{ color: 'var(--muted-foreground)' }}>
              <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Lição de casa
            </p>
            <p>{aula.descricao_tarefa || 'Sim'}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Fechar</Button>
          <Button onClick={() => setEditando(true)} className="flex-1">
            <Pencil className="w-4 h-4" aria-hidden="true" /> Editar aula
          </Button>
        </div>
      </div>
    </Modal>
  );
}
