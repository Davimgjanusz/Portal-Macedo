import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEACHER_EMAIL = 'phomacedo2021@gmail.com';
const TEACHER_PASSWORD = 'Macedo@2026';
const TEACHER_NAME = 'Professor Macedo';

// E-mails usados anteriormente pela conta do professor
const OLD_EMAILS = ['professor@portalmacedo.com'];

async function findUserByEmail(emails) {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => emails.includes(u.email?.toLowerCase()));
}

async function seed() {
  const existing = await findUserByEmail([TEACHER_EMAIL, ...OLD_EMAILS]);

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      email: TEACHER_EMAIL,
      password: TEACHER_PASSWORD,
      email_confirm: true,
      user_metadata: { ...existing.user_metadata, nome: TEACHER_NAME, role: 'teacher' },
    });
    if (error) {
      console.error('Erro ao atualizar professor:', error.message);
      process.exit(1);
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ email: TEACHER_EMAIL })
      .eq('id', existing.id);
    if (profileError) {
      console.error('Erro ao atualizar perfil:', profileError.message);
      process.exit(1);
    }

    console.log('Professor atualizado com sucesso!');
    console.log(`  Email: ${TEACHER_EMAIL}`);
    console.log(`  Senha: ${TEACHER_PASSWORD}`);
    console.log(`  ID:    ${existing.id}`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: TEACHER_EMAIL,
    password: TEACHER_PASSWORD,
    email_confirm: true,
    user_metadata: { nome: TEACHER_NAME, role: 'teacher' },
  });

  if (error) {
    console.error('Erro ao criar professor:', error.message);
    process.exit(1);
  }

  console.log('Professor criado com sucesso!');
  console.log(`  Email: ${TEACHER_EMAIL}`);
  console.log(`  Senha: ${TEACHER_PASSWORD}`);
  console.log(`  ID:    ${data.user.id}`);
}

seed();
