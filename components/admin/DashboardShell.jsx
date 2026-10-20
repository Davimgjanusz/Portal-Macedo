'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { DashboardContext } from '@/components/admin/useDashboard';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Spinner from '@/components/ui/Spinner';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  LogOut,
  Sun,
  Moon,
  GraduationCap,
  Menu,
  X,
  Home,
  Video,
  FileText,
} from 'lucide-react';

const teacherLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/alunos', label: 'Alunos', icon: Users },
  { href: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/admin/materiais', label: 'Materiais', icon: BookOpen },
];

const studentLinks = [
  { href: '/student', label: 'Início', icon: Home },
  { href: '/student/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/student/materiais', label: 'Materiais', icon: FileText },
  { href: '/student/videoaulas', label: 'Videoaulas', icon: Video },
];

function NavItem({ link, active, onClick }) {
  return (
    <Link
      href={link.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-[var(--sidebar-active)] text-white' : 'text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-hover)]'
      }`}
    >
      <link.icon className="w-4 h-4" aria-hidden="true" />
      {link.label}
    </Link>
  );
}

export default function DashboardShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark') setDark(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.user_metadata?.senha_provisoria) {
        router.replace('/alterar-senha');
        return;
      }
      setUser(user);
      supabase
        .from('profiles')
        .select('id, nome, email, role, telefone')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) console.error('Erro ao carregar perfil:', error.message);
          if (data) setProfile(data);
        });
    });
  }, [router]);

  const contextValue = useMemo(() => (user && profile ? { user, profile } : null), [user, profile]);

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev;
      const val = next ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', val);
      try { localStorage.setItem('theme', val); } catch {}
      return next;
    });
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const isTeacher = profile?.role === 'teacher';
  const links = isTeacher ? teacherLinks : studentLinks;
  const themeClass = profile ? (isTeacher ? 'theme-teacher' : 'theme-student') : '';

  return (
    <div className={`flex min-h-screen ${themeClass}`} style={{ background: 'var(--background)' }}>
      <aside
        aria-label="Navegação principal"
        className="hidden lg:flex flex-col w-64 fixed h-screen"
        style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--border)' }}
      >
        <div className="px-5 py-5 flex items-center gap-2" style={{ borderBottom: '1px solid var(--sidebar-hover)' }}>
          <GraduationCap className="w-6 h-6" style={{ color: 'var(--sidebar-active)' }} aria-hidden="true" />
          <span className="font-semibold tracking-tight" style={{ color: 'var(--sidebar-strong)' }}>Portal Macedo</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavItem key={link.href} link={link} active={pathname === link.href} />
          ))}
        </nav>

        <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--sidebar-hover)' }}>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors hover:bg-[var(--sidebar-hover)]"
            style={{ color: 'var(--sidebar-fg)' }}
          >
            {dark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            {dark ? 'Modo claro' : 'Modo escuro'}
          </button>
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>

      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 justify-between"
        style={{ background: 'var(--sidebar)', borderBottom: '1px solid var(--sidebar-hover)' }}
      >
        <span className="font-semibold text-sm" style={{ color: 'var(--sidebar-strong)' }}>Portal Macedo</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={sidebarOpen}
          className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)]"
          style={{ color: 'var(--sidebar-strong)' }}
        >
          {sidebarOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            aria-label="Navegação principal"
            className="absolute left-0 top-14 bottom-0 w-64 p-3 space-y-1"
            style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-hover)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((link) => (
              <NavItem
                key={link.href}
                link={link}
                active={pathname === link.href}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
            <hr style={{ borderColor: 'var(--sidebar-hover)' }} />
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors hover:bg-[var(--sidebar-hover)]"
              style={{ color: 'var(--sidebar-fg)' }}
            >
              {dark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
              {dark ? 'Modo claro' : 'Modo escuro'}
            </button>
            <button
              onClick={() => setConfirmLogout(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sair
            </button>
          </aside>
        </div>
      )}

      <ConfirmModal
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Sair da conta?"
        description="Você precisará informar e-mail e senha para entrar novamente."
        confirmLabel="Sair"
        variant="danger"
        loading={loggingOut}
      />

      <main id="conteudo" tabIndex={-1} className="flex-1 lg:ml-64 pt-14 lg:pt-0 outline-none">
        <div className="p-4 sm:p-6 lg:p-10 min-h-screen">
          {contextValue ? (
            <DashboardContext.Provider value={contextValue}>
              <div className="mb-8">
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Olá, <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{profile.nome}</span>
                </p>
              </div>
              {children}
            </DashboardContext.Provider>
          ) : (
            <Spinner />
          )}
        </div>
      </main>
    </div>
  );
}
