export function isoDe(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function hojeIso() {
  return isoDe(new Date());
}

export function intervaloDoMes(ano, mes) {
  const inicio = new Date(ano, mes, 1);
  const fim = new Date(ano, mes + 1, 0);
  return { inicio: isoDe(inicio), fim: isoDe(fim) };
}

export function celulasDoMes(ano, mes) {
  const primeiro = new Date(ano, mes, 1);
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const deslocamento = primeiro.getDay();
  const celulas = [];
  for (let i = 0; i < deslocamento; i++) celulas.push(null);
  for (let d = 1; d <= totalDias; d++) celulas.push(isoDe(new Date(ano, mes, d)));
  while (celulas.length % 7 !== 0) celulas.push(null);
  return celulas;
}

export function tituloDoMes(ano, mes) {
  const texto = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function dataExtensa(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
