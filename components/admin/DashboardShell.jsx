'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
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
  { href: '/student/materiais', label: 'Materiais', icon: FileText },
  { href: '/student/videoaulas', label: 'Videoaulas', icon: Video },
];

export default function DashboardShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data));
    });
  }, [router]);

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const isTeacher = profile?.role === 'teacher';
  const links = isTeacher ? teacherLinks : studentLinks;

  if (!user) return null;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Sidebar Desktop */}
      <aside
        className="hidden lg:flex flex-col w-64 border-r fixed h-screen"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="px-5 py-5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <GraduationCap className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          <span className="font-bold" style={{ color: 'var(--primary)' }}>Portal Macedo</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: active ? 'var(--primary)' : 'transparent',
                  color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors hover:bg-[var(--muted)]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? 'Modo Claro' : 'Modo Escuro'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b h-14 flex items-center px-4 justify-between"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>Portal Macedo</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="absolute left-0 top-14 bottom-0 w-64 border-r p-3 space-y-1"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <hr style={{ borderColor: 'var(--border)' }} />
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {dark ? 'Modo Claro' : 'Modo Escuro'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-red-500"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 bg-grid-math min-h-screen">
          {profile && (
            <div className="mb-6">
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Olá, <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{profile.nome}</span>
              </p>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
