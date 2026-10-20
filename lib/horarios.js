function paraMinutos(hora) {
  if (!hora) return null;
  const [h, m] = hora.slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

export function duracaoEmHoras(inicio, fim) {
  const a = paraMinutos(inicio);
  const b = paraMinutos(fim);
  if (a === null || b === null || b <= a) return null;
  return Math.round(((b - a) / 60) * 100) / 100;
}

export function formatarIntervalo(inicio, fim) {
  if (!inicio || !fim) return '';
  return `${inicio.slice(0, 5)} – ${fim.slice(0, 5)}`;
}
