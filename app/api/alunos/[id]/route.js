import { NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: requester } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (requester?.role !== 'teacher') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = await params;
    const service = await createServiceClient();

    const { data: aluno } = await service.from('profiles').select('role').eq('id', id).single();
    if (aluno?.role !== 'student') {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }

    const { error: profileErr } = await service.from('profiles').update({ ativo: false }).eq('id', id);
    if (profileErr) throw profileErr;

    const { error: authErr } = await service.auth.admin.updateUserById(id, { ban_duration: '876000h' });
    if (authErr) throw authErr;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erro ao excluir aluno' }, { status: 500 });
  }
}
