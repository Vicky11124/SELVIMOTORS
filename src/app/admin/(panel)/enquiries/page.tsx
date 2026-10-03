import { requireAdmin } from '@/lib/auth';
import EnquiriesList from '@/components/admin/EnquiriesList';
import type { Enquiry } from '@/lib/types';

export default async function AdminEnquiries() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from('enquiries')
    .select('*, bikes(brand, model, slug)')
    .order('created_at', { ascending: false });
  const list = (data ?? []) as Enquiry[];

  return <EnquiriesList initialList={list} />;
}
