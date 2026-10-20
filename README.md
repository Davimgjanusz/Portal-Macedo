# Portal Macedo

Plataforma web para um professor autônomo de matemática gerenciar aulas particulares. Ela reúne três áreas:

- **Site público:** apresentação do professor, metodologia, depoimentos, simulador de preço e contato por WhatsApp.
- **Painel do professor:** alunos, agenda, registro de aulas, materiais, indicadores financeiros e relatórios.
- **Área do aluno:** agenda, histórico de aulas, lições de casa, materiais, videoaulas e pagamento online.

## Funcionalidades

### Professor
- Cadastro de alunos com **senha provisória**, exibida uma única vez. No primeiro acesso, o aluno cria a própria senha.
- Exclusão de aluno com bloqueio de acesso. O histórico de aulas e pagamentos é preservado, e o aluno pode ser recadastrado com o mesmo e-mail.
- Registro de aulas com data, horário de início e término, modalidade (online ou presencial), **endereço** nas presenciais, conteúdo, lição de casa e status de pagamento. O valor é calculado automaticamente.
- Edição de qualquer aula do histórico, incluindo o status de pagamento, e filtro por período.
- **Agenda mensal própria**, sem Google Calendar.
- Dashboard com indicadores e gráficos de faturamento, aulas por mês, pagamentos e modalidade.
- **Relatório mensal em `.xlsx`** (abas Resumo, Por dia e Aulas), que abre no Excel ou no Google Sheets.
- **Dossiê do aluno em PDF.**

### Aluno
- Agenda mensal e histórico das próprias aulas.
- Pagamento de aulas pendentes pelo **Mercado Pago**.
- Materiais em PDF, exercícios e videoaulas.

### Geral
- Login com e-mail e senha ou **com Google** (apenas para contas já cadastradas).
- Recuperação de senha por e-mail e regras de senha forte.
- Modo claro e escuro sem piscar ao carregar, identidade visual distinta em cada área e layout responsivo.
- Cuidados de acessibilidade: rótulos em campos e botões, foco visível, link "Pular para o conteúdo" e respeito a "reduzir movimento".

## Tecnologias

- [Next.js 16](https://nextjs.org) (App Router, JavaScript) e React
- Tailwind CSS v4
- [Supabase](https://supabase.com): Auth, Postgres com RLS e Storage
- Mercado Pago (Checkout Pro e webhook)
- recharts (gráficos), three.js (efeito da home), exceljs (planilhas), pdfkit (PDF)
- react-hook-form e zod (formulários e validação)

## Como rodar localmente

Requisitos: Node.js 20 ou superior e um projeto no Supabase.

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

Acesse `http://localhost:3000`.

### Variáveis de ambiente

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, usada nos retornos do Mercado Pago |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço do Supabase. Só no servidor; nunca exponha |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acesso do Mercado Pago |

O `.env.local` está no `.gitignore` e não deve ser commitado.

## Configuração do Supabase

1. No SQL Editor, rode nesta ordem:
   1. `supabase/schema.sql` (tabelas, RLS, trigger de perfil e função do dashboard)
   2. `supabase/migrations/002_horario_aula.sql` (horário de início e fim)
   3. `supabase/migrations/003_endereco_aula.sql` (endereço da aula presencial)
2. Crie o bucket de Storage `materiais` para os PDFs.
3. Crie a conta do professor com o script abaixo, que lê o `.env.local`. Antes de rodar, troque o e-mail, o nome e a senha definidos no início do script:
   ```bash
   node scripts/seed-teacher.mjs
   ```
4. Em **Authentication > URL Configuration**, adicione às URLs de redirecionamento:
   - `http://localhost:3000/definir-senha` e `http://localhost:3000/auth/callback`
   - as mesmas rotas na URL de produção
5. Em **Authentication > Providers > Email**, ajuste o tamanho mínimo e a força exigida de senha.
6. Para o login com Google, ative o provedor Google com o Client ID e o Secret do Google Cloud, e desative **Allow new users to sign up** para que ninguém crie conta sozinho.
7. Para produção, configure um SMTP próprio em **Authentication > SMTP Settings**. O envio padrão do Supabase tem limite baixo.

## Mercado Pago

O aluno paga cada aula pendente pelo Checkout Pro. A confirmação chega pelo webhook em `/api/webhooks/mercadopago`, que marca a aula como paga. O Mercado Pago só consegue chamar uma URL pública, então em desenvolvimento use um túnel ou teste com o site publicado.

## Estrutura

```
app/
  (public)/        site público, login e telas de senha
  (dashboard)/     painel do professor (admin/) e área do aluno (student/)
  api/             rotas de servidor (alunos, exportações, pagamentos, webhook)
  auth/callback/   retorno do login com Google
components/        UI, painel, calendário e componentes do site
lib/               Supabase, Mercado Pago e utilitários (horários, senha, máscaras)
supabase/          schema e migrações SQL
scripts/           seed da conta do professor
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção (após o build) |
| `npm run lint` | Lint |

## Docker

O projeto gera saída `standalone` e tem `Dockerfile` e `docker-compose.yml`:

```bash
docker compose up --build
```

Passe as mesmas variáveis do `.env.local` para o container.
