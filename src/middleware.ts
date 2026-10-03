import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khwmvaaewghmobeqasul.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtod212YWFld2dobW9iZXFhc3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDg3NjEsImV4cCI6MjEwNjMyNDc2MX0.E-8TpwnjQDB_TMhws5fKO6fdbZdvHx5PF-hbg8tJO8g';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith('/admin/login');

  let response = NextResponse.next({ request });
  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    if (!isLogin) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        const u = request.nextUrl.clone();
        u.pathname = '/admin/login';
        u.search = '';
        return NextResponse.redirect(u);
      }
    }
  } catch {
    if (!isLogin) {
      const u = request.nextUrl.clone();
      u.pathname = '/admin/login';
      u.search = '';
      return NextResponse.redirect(u);
    }
  }
  return response;
}

export const config = { matcher: ['/admin/:path*'] };
