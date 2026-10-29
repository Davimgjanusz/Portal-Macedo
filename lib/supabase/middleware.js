import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const { pathname } = request.nextUrl;
  const protegida = pathname.startsWith('/admin') || pathname.startsWith('/student');

  if (!protegida && !(pathname === '/login' && claims)) {
    return supabaseResponse;
  }

  if (!claims) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  let role = claims.app_metadata?.role;
  if (!role) {
    // Sessões emitidas antes da migração 004 ainda não trazem o papel no token
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', claims.sub).single();
    role = profile?.role;
  }

  if (role !== 'teacher' && role !== 'student') {
    if (pathname === '/login') return supabaseResponse;
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const destino = role === 'teacher' ? '/admin' : '/student';

  if (pathname === '/login' || (pathname.startsWith('/admin') && role !== 'teacher') || (pathname.startsWith('/student') && role !== 'student')) {
    const url = request.nextUrl.clone();
    url.pathname = destino;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
