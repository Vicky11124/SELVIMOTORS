import PublicShell from '@/components/PublicShell';
import SpecularButton from '@/components/SpecularButton';

export default function NotFound() {
  return (
    <PublicShell>
      <div className="container-x py-28 text-center">
        <h1 className="text-5xl font-extrabold">Page not found</h1>
        <p className="mt-3 text-muted">That page or bike is no longer available.</p>
        <div className="mt-8">
          <SpecularButton href="/buy" variant="red" size="md">
            Browse bikes
          </SpecularButton>
        </div>
      </div>
    </PublicShell>
  );
}
