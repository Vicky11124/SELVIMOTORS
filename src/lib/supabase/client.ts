import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khwmvaaewghmobeqasul.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtod212YWFld2dobW9iZXFhc3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDg3NjEsImV4cCI6MjEwNjMyNDc2MX0.E-8TpwnjQDB_TMhws5fKO6fdbZdvHx5PF-hbg8tJO8g';

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

