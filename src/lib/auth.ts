import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createClient } from './supabase/server';

/** Server-side admin gate with per-request memoization to eliminate duplicate auth roundtrips. */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/admin/login');
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) redirect('/admin/login?error=forbidden');
  return { supabase, user: data.user };
});
