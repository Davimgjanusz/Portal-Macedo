import { ArrowRight, Calculator, BookOpen, Target, UserCheck } from 'lucide-react';
import PriceCalculator from '@/components/public/PriceCalculator';
import Testimonials from '@/components/public/Testimonials';
import ContactForm from '@/components/public/ContactForm';

export const metadata = {
  title: 'Portal Macedo — Aulas Particulares de Matemática',
  description: 'Aulas particulares de matemática com acompanhamento individualizado. Presencial ou online.',
};

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
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contato"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Agendar Aula <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#simulador"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border font-medium transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <Calculator className="w-4 h-4" />
              Simular Valores
            </a>
          </div>
        </div>
      </section>

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
              </div>
            ))}
          </div>
        </div>
      </section>

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
        <ContactForm />
      </section>
    </main>
  );
}
