<<<<<<< HEAD
import { ArrowRight, Calculator, BookOpen, Target, UserCheck } from 'lucide-react';
import PriceCalculator from '@/components/public/PriceCalculator';
import Testimonials from '@/components/public/Testimonials';
import ContactForm from '@/components/public/ContactForm';
=======
import { ArrowRight, Calculator, BookOpen, Target, UserCheck, GraduationCap, Award, Users } from 'lucide-react';
import PriceCalculator from '@/components/public/PriceCalculator';
import Testimonials from '@/components/public/Testimonials';
import ContactForm from '@/components/public/ContactForm';
import HeroScene from '@/components/public/HeroScene';
import Typewriter from '@/components/public/Typewriter';

const FRASES_HERO = [
  'resultado que você enxerga',
  'compreensão de verdade',
  'a nota que você precisa',
  'matemática sem decoreba',
];
>>>>>>> master

export const metadata = {
  title: 'Portal Macedo — Aulas Particulares de Matemática',
  description: 'Aulas particulares de matemática com acompanhamento individualizado. Presencial ou online.',
};

<<<<<<< HEAD
export default function LandingPage() {
  return (
    <main className="bg-grid-math">
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6" style={{ color: 'var(--foreground)' }}>
            Matemática descomplicada,{' '}
            <span style={{ color: 'var(--primary)' }}>resultado garantido</span>
          </h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Aulas particulares com metodologia focada em resolução de problemas e acompanhamento pedagógico individualizado. Presencial ou por chamada de vídeo.
=======
const metodologia = [
  {
    icon: Target,
    title: 'Diagnóstico Inicial',
    desc: 'Identifico as dificuldades específicas do aluno para montar um plano de estudos personalizado.',
  },
  {
    icon: BookOpen,
    title: 'Resolução Guiada',
    desc: 'Aulas focadas em exercícios práticos com complexidade progressiva, construindo confiança.',
  },
  {
    icon: UserCheck,
    title: 'Acompanhamento Contínuo',
    desc: 'Dossiê pedagógico individual com histórico de conteúdos, tarefas e evolução do aluno.',
  },
];

export default function LandingPage() {
  return (
    <main id="conteudo" tabIndex={-1} className="outline-none">
      <section
        className="relative overflow-hidden text-white flex min-h-svh items-center"
        style={{ background: 'linear-gradient(135deg, var(--hero-from), var(--hero-to))' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 85% 0%, rgba(96,165,250,0.22), transparent 70%), radial-gradient(40% 40% at 0% 100%, rgba(251,191,36,0.12), transparent 70%)',
          }}
        />
        <HeroScene />
        <div className="relative w-full max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center">
          <p className="inline-block text-xs font-semibold uppercase tracking-[0.2em] mb-6 px-3 py-1 rounded-full border border-white/20 text-white/80">
            Matemática para o Ensino Médio e ENEM
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Matemática com método,
            <br />
            <span style={{ color: 'var(--accent)' }}>
              <Typewriter phrases={FRASES_HERO} />
            </span>
          </h1>
          <p className="text-lg mb-10 max-w-2xl mx-auto text-white/75">
            Aulas particulares focadas em resolução de problemas e acompanhamento individualizado. Presencial ou por chamada de vídeo.
>>>>>>> master
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contato"
<<<<<<< HEAD
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
=======
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg transition-all hover:brightness-110 hover:shadow-xl active:scale-[0.97]"
              style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
>>>>>>> master
            >
              Agendar Aula <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#simulador"
<<<<<<< HEAD
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border font-medium transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
=======
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/30 font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.97]"
>>>>>>> master
            >
              <Calculator className="w-4 h-4" />
              Simular Valores
            </a>
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* Metodologia */}
      <section id="metodologia" className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Metodologia</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Target,
                title: 'Diagnóstico Inicial',
                desc: 'Identifico as dificuldades específicas do aluno para montar um plano de estudos personalizado.',
              },
              {
                icon: BookOpen,
                title: 'Resolução Guiada',
                desc: 'Aulas focadas em exercícios práticos com complexidade progressiva, construindo confiança.',
              },
              {
                icon: UserCheck,
                title: 'Acompanhamento Contínuo',
                desc: 'Dossiê pedagógico individual com histórico de conteúdos, tarefas e evolução do aluno.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border p-6 text-center shadow-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div
                  className="inline-flex rounded-lg p-3 mb-4"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
=======
      <section id="metodologia" className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>
            Como funciona
          </p>
          <h2 className="font-display text-3xl font-bold text-center mb-12">Metodologia</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {metodologia.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border p-7 transition-shadow hover:shadow-lg"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div
                  className="inline-flex rounded-xl p-3 mb-5"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
>>>>>>> master
              </div>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* Depoimentos */}
      <section className="py-16">
        <Testimonials />
      </section>

      {/* Simulador */}
      <section className="py-16">
        <h2 className="text-2xl font-bold text-center mb-8">Simule o Valor da Sua Aula</h2>
        <PriceCalculator />
      </section>

      {/* Contato */}
      <section className="py-16">
=======
      <section id="professor" className="py-20" style={{ background: 'var(--card)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>
            Quem ensina
          </p>
          <h2 className="font-display text-3xl font-bold text-center mb-12">Sobre o Professor</h2>
          <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            <div
              className="flex-shrink-0 rounded-2xl p-8"
              style={{ background: 'linear-gradient(135deg, var(--hero-from), var(--hero-to))', color: '#FFFFFF' }}
            >
              <GraduationCap className="w-14 h-14" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-display text-2xl font-bold mb-3">Professor Macedo</h3>
              <p className="leading-relaxed mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Matemático dedicado ao ensino, com experiência em aulas particulares para alunos do ensino médio e preparação para vestibulares e ENEM. Meu objetivo é fazer você entender a matemática, não apenas decorar fórmulas.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-3">
                {[
                  { icon: Award, label: 'Formação em Matemática' },
                  { icon: Users, label: 'Acompanhamento individual' },
                  { icon: Target, label: 'Metodologia personalizada' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <Testimonials />
      </section>

      <section className="py-20" style={{ background: 'var(--card)' }}>
        <p className="text-center text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>
          Investimento
        </p>
        <h2 className="font-display text-3xl font-bold text-center mb-12">Simule o Valor da Sua Aula</h2>
        <PriceCalculator />
      </section>

      <section className="py-20">
>>>>>>> master
        <ContactForm />
      </section>
    </main>
  );
}
