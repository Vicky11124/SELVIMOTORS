import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import Logo from './Logo';
import { ADDRESS, CONTACT_EMAIL, PHONE_NUMBER } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[#0E3B2E]/30 bg-[#0E3B2E] text-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-2 text-sm tracking-[0.25em] text-accent font-bold">RIDE WITH CONFIDENCE</p>
          <p className="mt-4 max-w-xs text-sm text-white/80">Quality pre-owned motorcycles, inspected and ready for the road.</p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-accent uppercase tracking-wider">Explore</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link className="hover:text-white transition-colors" href="/buy">Buy a bike</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/sell">Sell your bike</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/about">About us</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-accent uppercase tracking-wider">Visit or call</h3>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-accent" />{ADDRESS}</li>
            {PHONE_NUMBER && <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-accent" /><a className="hover:text-white transition-colors" href={`tel:${PHONE_NUMBER}`}>{PHONE_NUMBER}</a></li>}
            {CONTACT_EMAIL && <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-accent" /><a className="hover:text-white transition-colors" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">© {new Date().getFullYear()} Selvi Motors. All rights reserved.</div>
    </footer>
  );
}
