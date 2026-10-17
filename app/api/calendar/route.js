import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { criarEventoAula, listarEventos } from '@/lib/google/calendar';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { aluno, data, duracao, modalidade, linkChamada } = body;

    const result = await criarEventoAula({ aluno, data, duracao, modalidade, linkChamada });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin') || new Date().toISOString();
    const timeMax =
      searchParams.get('timeMax') ||
      new Date(Date.now() + 7 * 86400000).toISOString();

    const events = await listarEventos(timeMin, timeMax);
    return NextResponse.json(events);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
