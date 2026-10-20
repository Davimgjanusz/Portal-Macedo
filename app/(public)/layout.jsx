'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Sun, Moon, GraduationCap } from 'lucide-react';

export default function PublicLayout({ children }) {
  const [dark, setDark] = useState(false);
  const [rolado, setRolado] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark') setDark(true);
  }, []);

  useEffect(() => {
    function aoRolar() {
      setRolado(window.scrollY > 10);
    }
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev;
      const val = next ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', val);
      try { localStorage.setItem('theme', val); } catch {}
      return next;
    });
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 pointer-events-none">
        <div
          data-solida={rolado}
          className="group pointer-events-auto mx-auto flex h-14 w-full max-w-[990px] items-center justify-between gap-4 rounded-full border border-transparent pl-5 pr-2 text-white transition-all duration-[600ms] ease-[cubic-bezier(0.19,1,0.22,1)] data-[solida=true]:border-[var(--border)] data-[solida=true]:bg-[color-mix(in_srgb,var(--card)_90%,transparent)] data-[solida=true]:text-[var(--foreground)] data-[solida=true]:backdrop-blur-[10px] data-[solida=true]:shadow-sm hover:border-[var(--border)] hover:bg-[color-mix(in_srgb,var(--card)_90%,transparent)] hover:text-[var(--foreground)] hover:backdrop-blur-[10px]"
        >
          <Link href="/" className="flex items-center gap-2 font-bold text-base sm:text-lg">
            <GraduationCap
              className="w-6 h-6 text-[#93C5FD] transition-colors duration-[600ms] group-hover:text-[var(--primary)] group-data-[solida=true]:text-[var(--primary)]"
              aria-hidden="true"
            />
            Portal Macedo
          </Link>

          <Link
            href="/login"
            className="inline-flex px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:brightness-110"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Acessar portal
          </Link>
        </div>
      </header>

      {children}

      <footer className="border-t py-8" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            &copy; 2026 Portal Macedo — Aulas Particulares de Matemática
          </p>
        </div>
      </footer>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        aria-pressed={dark}
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-11 h-11 rounded-full border shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
      >
        {dark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
      </button>
    </>
  );
}
