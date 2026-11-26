export default function Loading() {
  return (
    <div className="flex min-h-[62vh] flex-col items-center justify-center bg-ivory px-4 py-20 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-soft-pink/70 via-ivory to-soft-lavender/80 blur-sm" />
        <svg
          viewBox="0 0 100 100"
          className="animate-bridal-halo absolute inset-0 h-full w-full text-champagne/65"
          fill="none"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2.5 6"
            strokeLinecap="round"
          />
        </svg>
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-rose-gold/35 bg-white/90 shadow-card">
          <span className="font-serif text-2xl font-semibold text-plum">B</span>
        </div>
      </div>

      <p className="mt-4 font-serif text-xl font-medium tracking-wide text-charcoal">
        BellaBridal Atelier
      </p>
      <div className="mt-3 h-[2px] w-36 overflow-hidden rounded-full bg-lavender-deep">
        <div className="animate-bridal-shimmer h-full w-full bg-gradient-to-r from-plum via-rose-gold to-champagne" />
      </div>
      <p className="mt-2 text-xs tracking-wider text-muted">
        Đang chuẩn bị không gian váy cưới...
      </p>
    </div>
  );
}
