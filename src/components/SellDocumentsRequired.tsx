import { CheckCircle2, FileText } from 'lucide-react';

const REQUIRED_DOCUMENTS = [
  {
    title: 'RC Book',
    description: 'Required for ownership verification and RC transfer',
  },
  {
    title: 'ID Proof',
    description: 'Aadhaar, PAN, Passport, or Driving Licence',
  },
  {
    title: 'Insurance Papers',
    description: 'Used to verify the insurance history of the bike',
  },
  {
    title: 'Loan NOC (If Applicable)',
    description: 'Required if your bike is under active loan',
  },
];

export default function SellDocumentsRequired() {
  return (
    <section className="relative py-10 sm:py-14 lg:py-16 bg-background border-b border-border/60 overflow-hidden">
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[350px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]"
        aria-hidden="true"
      />

      <div className="container-x">
        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary shadow-sm mb-2 sm:mb-3">
            <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            HASSLE-FREE VERIFICATION
          </div>

          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-text-strong sm:text-3xl lg:text-4xl leading-[1.1]">
            Documents Required to Sell Your Bike in{' '}
            <span className="text-primary">Chennai</span>
          </h2>

          <p className="mt-1.5 sm:mt-2.5 text-[11px] sm:text-sm md:text-base text-text/80 font-medium leading-relaxed max-w-lg mx-auto">
            Keep these essential documents ready for instant valuation and smooth RC ownership transfer.
          </p>
        </div>

        {/* 2x2 Grid of Document Cards */}
        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5">
          {REQUIRED_DOCUMENTS.map((doc, idx) => (
            <div
              key={idx}
              className="group relative flex items-start gap-3.5 sm:gap-4 rounded-xl sm:rounded-2xl border border-border/90 bg-surface p-4 sm:p-5 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Top rim gradient effect */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-t-2xl" />

              {/* Checkmark Icon Circle */}
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm sm:text-base font-bold text-text-strong group-hover:text-primary transition-colors">
                  {doc.title}
                </h3>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-text/75 leading-relaxed font-medium">
                  {doc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
