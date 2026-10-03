import type { Metadata } from 'next';
import { Clock, Compass, Mail, MapPin, MessageCircle, Phone, Sparkles } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';
import SpecularButton from '@/components/ui/SpecularButton';
import { CONTACT_EMAIL, PHONE_NUMBER, WHATSAPP_NUMBER, whatsappLink, MAPS_PLACE_URL, MAPS_EMBED_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact Us | Selvi Motors Saidapet, Chennai',
  description: 'Get in touch with Selvi Motors in Saidapet, Chennai. Call, WhatsApp, send an enquiry, or visit our pre-owned motorcycle showroom.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="pb-16 sm:pb-24">
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden border-b border-line bg-[#0E3B2E] text-white pt-6 pb-8 sm:pt-20 sm:pb-24 mb-10 sm:mb-16">
        {/* Ambient subtle glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[360px] w-[500px] -translate-x-1/2 rounded-full bg-white/10 blur-[100px] sm:h-[480px] sm:w-[700px] sm:blur-[120px]"
        />

        <div className="container-x">
          <div className="mx-auto max-w-4xl text-center">
            {/* Header Badge */}
            <div className="animate-slide-left inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-cream uppercase sm:px-4 sm:py-1.5 sm:text-xs">
              <Sparkles className="h-2.5 w-2.5 text-accent sm:h-3.5 sm:w-3.5" />
              <span className="sm:hidden">Contact Selvi Motors • Saidapet</span>
              <span className="hidden sm:inline">Contact Selvi Motors • Saidapet, Chennai</span>
            </div>

            {/* Main Headline */}
            <h1 className="animate-slide-left-delay-1 mt-2.5 text-2xl font-extrabold tracking-tight text-white xs:text-3xl sm:mt-6 sm:text-6xl sm:leading-[1.1]">
              WE&apos;RE HERE TO HELP.{' '}
              <span className="block text-cream">
                LET&apos;S TALK BIKES.
              </span>
            </h1>

            {/* Concise Intro */}
            <p className="animate-slide-left-delay-2 mt-2.5 text-xs leading-relaxed text-cream/90 sm:mt-6 sm:text-xl">
              Have a question about buying, selling, or exchanging a motorcycle? Call, WhatsApp, or visit our Saidapet showroom today.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-2 max-w-sm mx-auto sm:max-w-none sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              {WHATSAPP_NUMBER && (
                <SpecularButton
                  href={whatsappLink('Hi Selvi Motors, I have a question about a bike.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="green"
                  size="lg"
                  fullWidth
                  className="order-1 col-span-1 sm:order-none sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp<span className="hidden sm:inline"> Showroom</span></span>
                </SpecularButton>
              )}

              {PHONE_NUMBER && (
                <SpecularButton
                  href={`tel:${PHONE_NUMBER}`}
                  variant="white"
                  size="lg"
                  fullWidth
                  className="order-3 col-span-2 sm:order-none sm:w-auto"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call {PHONE_NUMBER}</span>
                </SpecularButton>
              )}

              <SpecularButton
                href={MAPS_PLACE_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="dark"
                size="lg"
                fullWidth
                className="order-2 col-span-1 sm:order-none sm:w-auto"
              >
                <Compass className="h-4 w-4" />
                <span>Get Directions</span>
              </SpecularButton>
            </div>

            {/* Quick Badges Pill Bar */}
            <div className="hidden sm:flex sm:mt-10 sm:flex-wrap sm:items-center sm:justify-center sm:gap-3 text-xs font-medium text-cream">
              <div className="flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-center transition hover:border-white/40 sm:rounded-full sm:px-3 sm:py-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="truncate">Saidapet, Chennai</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-center transition hover:border-white/40 sm:rounded-full sm:px-3 sm:py-1">
                <Phone className="h-3.5 w-3.5 shrink-0 text-white" />
                <span className="truncate">Direct Phone Support</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-center transition hover:border-white/40 sm:rounded-full sm:px-3 sm:py-1">
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="truncate">Instant WhatsApp</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-center transition hover:border-white/40 sm:rounded-full sm:px-3 sm:py-1">
                <Clock className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                <span className="truncate">Mon - Sun: 10am - 9pm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <div className="container-x">
        {/* Main Grid: Details + Map + Enquiry Form */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Contact Details Card */}
          <div className="order-1 lg:order-1 lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-line bg-surface p-6 space-y-6 shadow-xl sm:p-8">
              <h2 className="text-lg font-bold text-dark border-b border-line pb-3">
                Showroom Information
              </h2>

              <ul className="space-y-4 text-xs sm:text-sm">
                <li className="flex gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <strong className="block text-dark">Address</strong>
                    <span className="text-slate">
                      No: 117/22, Bazaar Street, Saidapet, Chennai – 600015
                    </span>
                  </div>
                </li>

                <li className="flex gap-3">
                  <Clock className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <strong className="block text-dark">Opening Hours</strong>
                    <span className="text-slate">
                      Monday to Sunday: 10:00 AM – 9:00 PM
                    </span>
                  </div>
                </li>

                {PHONE_NUMBER && (
                  <li className="flex gap-3">
                    <Phone className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <strong className="block text-dark">Phone Support</strong>
                      <a href={`tel:${PHONE_NUMBER}`} className="text-slate hover:text-primary underline">
                        {PHONE_NUMBER}
                      </a>
                    </div>
                  </li>
                )}

                {CONTACT_EMAIL && (
                  <li className="flex gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <strong className="block text-dark">Email Address</strong>
                      <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate hover:text-primary underline">
                        {CONTACT_EMAIL}
                      </a>
                    </div>
                  </li>
                )}
              </ul>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {WHATSAPP_NUMBER && (
                  <SpecularButton
                    href={whatsappLink('Hi Selvi Motors, I have a question.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="green"
                    size="md"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Showroom</span>
                  </SpecularButton>
                )}

                <SpecularButton
                  href={MAPS_PLACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="dark"
                  size="md"
                >
                  <Compass className="h-4 w-4" />
                  <span>Open Google Maps</span>
                </SpecularButton>
              </div>
            </div>
          </div>

          {/* Map Integration Section */}
          <section className="order-2 lg:order-3 lg:col-span-12 overflow-hidden rounded-2xl border border-primary/30 bg-surface shadow-xl">
            <div className="flex flex-col items-start justify-between gap-3 border-b border-primary/20 bg-[#0E3B2E] p-4 sm:flex-row sm:items-center sm:px-6 text-white">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-white sm:text-lg">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  <span>Selvi Motors Showroom Map</span>
                </h3>
                <p className="text-xs text-emerald-100/90 font-medium">
                  No: 117/22, Bazaar Street, Saidapet, Chennai – 600015
                </p>
              </div>
              <SpecularButton
                href={MAPS_PLACE_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="white"
                size="sm"
              >
                <Compass className="h-4 w-4" />
                <span>Get Showroom Directions</span>
              </SpecularButton>
            </div>

            <iframe
              title="Selvi Motors Location Map"
              src={MAPS_EMBED_URL}
              className="h-[320px] w-full border-0 sm:h-[420px]"
              loading="lazy"
            />
          </section>

          {/* Right Column: Enquiry Form */}
          <div className="order-3 lg:order-2 lg:col-span-7">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-xl sm:p-8">
              <h2 className="text-lg font-bold text-dark mb-1">
                Send an Enquiry
              </h2>
              <p className="text-xs text-slate mb-6">
                Fill in your details below and our team will respond promptly.
              </p>
              <EnquiryForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
