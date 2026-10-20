export const PASSWORD_RULES = [
  { id: 'length', label: 'Pelo menos 6 caracteres', test: (p) => p.length >= 6 },
  { id: 'upper', label: 'Uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Uma letra minúscula', test: (p) => /[a-z]/.test(p) },
  { id: 'digit', label: 'Um número', test: (p) => /\d/.test(p) },
  { id: 'symbol', label: 'Um símbolo (ex.: ! @ # $ %)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function checarSenha(password, email = '') {
  const regras = PASSWORD_RULES.map((r) => ({ id: r.id, label: r.label, ok: r.test(password) }));
  const local = email.split('@')[0]?.toLowerCase();
  const contemEmail = !!local && local.length >= 4 && password.toLowerCase().includes(local);
  const ok = regras.every((r) => r.ok) && !contemEmail;
  const satisfeitas = regras.filter((r) => r.ok).length + (password.length >= 14 ? 1 : 0);
  const nivel = satisfeitas <= 2 ? 'fraca' : satisfeitas <= 4 ? 'média' : 'forte';
  return { regras, contemEmail, ok, nivel, satisfeitas };
}
