import { NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'teacher') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { email, nome, telefone } = body;

    if (!email || !nome) {
      return NextResponse.json({ error: 'E-mail e nome são obrigatórios' }, { status: 400 });
    }

    const serviceClient = await createServiceClient();

    const { data: newUser, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-10) + 'A1!',
      email_confirm: true,
      user_metadata: { nome, role: 'student' },
    });

    if (authError) throw authError;

    if (telefone && newUser?.user?.id) {
      await serviceClient
        .from('profiles')
        .update({ telefone })
        .eq('id', newUser.user.id);
    }

    return NextResponse.json({ id: newUser.user.id, message: 'Aluno criado com sucesso' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
