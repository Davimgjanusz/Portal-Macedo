import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { appendRows } from '@/lib/google/sheets';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const targetDate = body.targetDate || new Date().toISOString().split('T')[0];

    const { data: aulas, error } = await supabase
      .from('aulas_registro')
      .select('*, profiles!aulas_registro_student_id_fkey(nome)')
      .eq('teacher_id', user.id)
      .eq('data_aula', targetDate)
      .order('created_at');

    if (error) throw error;

    if (!aulas || aulas.length === 0) {
      return NextResponse.json({ message: 'Nenhuma aula encontrada nesta data' });
    }

    const rows = aulas.map((a) => ({
      data: new Date(a.data_aula).toLocaleDateString('pt-BR'),
      aluno: a.profiles?.nome || '—',
      modalidade: a.modalidade,
      horas: Number(a.duracao_horas).toFixed(1),
      valor: `R$ ${Number(a.valor_pago).toFixed(2)}`,
      status_pagamento: a.status_pagamento,
    }));

    await appendRows(rows);

    return NextResponse.json({ message: `${rows.length} aulas exportadas para o Google Sheets` });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
