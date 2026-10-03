import PublicShell from '@/components/PublicShell';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
