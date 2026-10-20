import { NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';
<<<<<<< HEAD
=======
import { gerarSenhaProvisoria } from '@/lib/senha-provisoria';
>>>>>>> master

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
<<<<<<< HEAD

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
=======
    const senhaProvisoria = gerarSenhaProvisoria();

    const { data: existente } = await serviceClient
      .from('profiles')
      .select('id, role, ativo')
      .eq('email', email)
      .maybeSingle();

    if (existente) {
      if (existente.role !== 'student') {
        return NextResponse.json({ error: 'Este e-mail já pertence a outra conta' }, { status: 409 });
      }
      if (existente.ativo) {
        return NextResponse.json({ error: 'Já existe um aluno ativo com este e-mail' }, { status: 409 });
      }

      const { error: authErr } = await serviceClient.auth.admin.updateUserById(existente.id, {
        password: senhaProvisoria,
        ban_duration: 'none',
        user_metadata: { nome, role: 'student', senha_provisoria: true },
      });
      if (authErr) throw authErr;

      const { error: reativarErr } = await serviceClient
        .from('profiles')
        .update({ ativo: true, nome, telefone: telefone || null })
        .eq('id', existente.id);
      if (reativarErr) throw reativarErr;

      return NextResponse.json({ id: existente.id, senhaProvisoria, reativado: true });
    }

    const { data: novo, error: createErr } = await serviceClient.auth.admin.createUser({
      email,
      password: senhaProvisoria,
      email_confirm: true,
      user_metadata: { nome, role: 'student', senha_provisoria: true },
    });
    if (createErr) throw createErr;

    if (telefone) {
      await serviceClient.from('profiles').update({ telefone }).eq('id', novo.user.id);
    }

    return NextResponse.json({ id: novo.user.id, senhaProvisoria, reativado: false });
>>>>>>> master
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
