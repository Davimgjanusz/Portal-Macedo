import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEACHER_EMAIL = 'professor@portalmacedo.com';
const TEACHER_PASSWORD = 'Macedo@2026';
const TEACHER_NAME = 'Professor Macedo';

async function seed() {
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
