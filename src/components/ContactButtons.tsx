import { MessageCircle, Phone, Mail } from 'lucide-react';
import type { Bike } from '@/lib/types';
import { PHONE_NUMBER, WHATSAPP_NUMBER, bikeWhatsappMessage, whatsappLink } from '@/lib/utils';

export default function ContactButtons({ bike }: { bike: Bike }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col sm:gap-3">
      {/* 1. Enquire / Book Test Ride - Primary Conversion CTA */}
      <a
        href="#enquire"
        className="col-span-2 btn-red !py-2.5 sm:!py-3 text-xs sm:text-sm font-semibold justify-center sm:w-full transition-colors"
      >
        <Mail size={16} /> Enquire / Book Test Ride
      </a>

      {/* 2. WhatsApp */}
      <a
        href={whatsappLink(bikeWhatsappMessage(bike))}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!WHATSAPP_NUMBER}
        className="btn-green !py-2 sm:!py-3 text-xs sm:text-sm font-semibold justify-center shadow-md"
      >
        <MessageCircle size={16} /> WhatsApp
      </a>

      {/* 3. Call Us */}
      <a
        href={PHONE_NUMBER ? `tel:${PHONE_NUMBER}` : '#enquire'}
        className="btn-outline !py-2 sm:!py-3 text-xs sm:text-sm font-semibold justify-center"
      >
        <Phone size={16} /> Call Us
      </a>
    </div>
  );
}
