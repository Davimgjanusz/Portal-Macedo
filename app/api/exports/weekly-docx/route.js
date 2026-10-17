import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { gerarRelatorioSemanal } from '@/lib/docx-generator';
import { Packer } from 'docx';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate e endDate são obrigatórios' }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: aulas, error } = await supabase
      .from('aulas_registro')
      .select('*, profiles!aulas_registro_student_id_fkey(nome)')
      .eq('teacher_id', user.id)
      .gte('data_aula', startDate)
      .lte('data_aula', endDate)
      .order('data_aula');

    if (error) throw error;

    const formattedAulas = (aulas || []).map((a) => ({
      ...a,
      student_name: a.profiles?.nome,
    }));

    const doc = gerarRelatorioSemanal(formattedAulas, startDate, endDate);
    const buffer = await Packer.toBuffer(doc);

    const weekNum = getWeekNumber(new Date(startDate));

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="relatorio-semana-${weekNum}.docx"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function getWeekNumber(d) {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
}
