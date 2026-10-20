import { randomInt } from 'crypto';

const MINUSCULAS = 'abcdefghijkmnopqrstuvwxyz';
const MAIUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const NUMEROS = '23456789';
const SIMBOLOS = '!@#$%&*?';
const TODOS = MINUSCULAS + MAIUSCULAS + NUMEROS + SIMBOLOS;

function escolher(conjunto) {
  return conjunto[randomInt(conjunto.length)];
}

export function gerarSenhaProvisoria(tamanho = 10) {
  const chars = [escolher(MINUSCULAS), escolher(MAIUSCULAS), escolher(NUMEROS), escolher(SIMBOLOS)];
  while (chars.length < tamanho) chars.push(escolher(TODOS));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
