import { Star } from 'lucide-react';

const depoimentos = [
  {
    nome: 'Ana Clara',
    tipo: 'Aluna - 9º ano',
    texto: 'As aulas do professor Macedo me ajudaram a passar de 4 para 8,5 em matemática. A didática dele é incrível!',
    estrelas: 5,
  },
  {
    nome: 'Carlos Eduardo',
    tipo: 'Pai de aluno',
    texto: 'Meu filho sempre teve dificuldade com matemática. Com o acompanhamento individualizado, a evolução foi rápida e visível.',
    estrelas: 5,
  },
  {
    nome: 'Juliana Mendes',
    tipo: 'Aluna - ENEM',
    texto: 'Consegui a nota que precisava no ENEM graças às aulas focadas em exercícios de prova. Recomendo muito!',
    estrelas: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="depoimentos" className="w-full max-w-5xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-center mb-8">O que dizem meus alunos</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {depoimentos.map((d, i) => (
          <div
            key={i}
            className="rounded-xl border p-5 shadow-sm"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
          >
            <div className="flex gap-1 mb-3">
              {Array.from({ length: d.estrelas }).map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
              &ldquo;{d.texto}&rdquo;
            </p>
            <div>
              <p className="text-sm font-semibold">{d.nome}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{d.tipo}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
