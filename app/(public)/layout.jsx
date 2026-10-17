'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Sun, Moon, GraduationCap } from 'lucide-react';

const navLinks = [
  { href: '/#metodologia', label: 'Metodologia' },
  { href: '/#depoimentos', label: 'Depoimentos' },
  { href: '/#simulador', label: 'Simulador' },
  { href: '/#contato', label: 'Contato' },
];

export default function PublicLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  }

  return (
    <>
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--primary)' }}>
            <GraduationCap className="w-6 h-6" />
            Portal Macedo
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: 'var(--foreground)' }}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Acessar Portal
            </Link>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t px-4 pb-4 space-y-2" style={{ borderColor: 'var(--border)' }}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium"
              style={{ color: 'var(--primary)' }}
            >
              Acessar Portal
            </Link>
            <button onClick={toggleTheme} className="flex items-center gap-2 py-2 text-sm">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {dark ? 'Modo Claro' : 'Modo Escuro'}
            </button>
          </div>
        )}
      </header>

      {children}

      {/* Footer */}
      <footer
        className="border-t py-8"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            &copy; 2026 Portal Macedo — Aulas Particulares de Matemática
          </p>
        </div>
      </footer>
    </>
  );
}
