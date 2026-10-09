import type { Metadata } from 'next';
import SellPageClient from '@/components/SellPageClient';
import { getBrands } from '@/lib/queries';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Sell Your Bike | Get The Right Value | Selvi Motors',
  description: 'Sell your pre-owned motorcycle with Selvi Motors in Chennai. Free doorstep evaluation, trusted dealership, instant valuation, and best market price.',
  alternates: { canonical: '/sell' },
};

export default async function SellPage() {
  const brands = await getBrands().catch(() => []);

  return <SellPageClient brands={brands} />;
}
