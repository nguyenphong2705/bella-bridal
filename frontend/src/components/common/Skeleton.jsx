export function DressCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-blush-pink/50 bg-white p-3">
      <div className="aspect-[3/4] w-full rounded-xl bg-cream" />
      <div className="mt-4 space-y-2 px-1">
        <div className="h-3 w-20 rounded bg-soft-pink" />
        <div className="h-5 w-3/4 rounded bg-cream" />
        <div className="h-4 w-1/2 rounded bg-cream" />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blush-pink border-t-rose-gold" />
        <p className="font-serif text-lg italic text-muted">BellaBridal...</p>
      </div>
    </div>
  );
}
