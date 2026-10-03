import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import BikeForm from '@/components/admin/BikeForm';
import type { Bike } from '@/lib/types';

export default async function EditBike({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('bikes').select('*, bike_images(*)').eq('id', id).maybeSingle();
  if (!data) notFound();
  return (<div><h1 className="mb-6 text-2xl font-bold">Edit bike</h1><BikeForm bike={data as Bike} /></div>);
}
