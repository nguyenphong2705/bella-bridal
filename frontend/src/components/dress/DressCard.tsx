import Image from 'next/image';
import Link from 'next/link';
import { Film, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { Dress } from '@/types';

export default function DressCard({ dress, priority = false }: { dress: Dress; priority?: boolean }) {
  const primaryImage =
    dress.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80';

  return (
    <Link
      href={`/bo-suu-tap/${dress.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-blush-pink/60 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-cream">
        <Image
          src={primaryImage}
          alt={dress.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {Boolean(dress.is_featured) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory/90 px-2.5 py-1 text-[11px] font-medium text-rose-gold-dark backdrop-blur">
              <Sparkles className="h-3 w-3" /> Nổi bật
            </span>
          )}
          {dress.video_url && (
            <span className="inline-flex items-center gap-1 rounded-full bg-charcoal/80 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              <Film className="h-3 w-3" /> Lookbook Video
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-plum">
            {dress.category?.name || dress.silhouette} • {dress.code}
          </p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-charcoal group-hover:text-plum">
            {dress.name}
          </h3>
          {dress.material && <p className="mt-1 line-clamp-1 text-xs text-muted">{dress.material}</p>}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-lavender-deep/50 pt-3">
          <div>
            <span className="block text-[11px] text-muted">Giá thuê từ</span>
            <span className="text-sm font-semibold text-charcoal">{formatCurrency(dress.rental_price)}</span>
          </div>
          <span className="text-xs font-semibold text-plum group-hover:underline">Xem chi tiết →</span>
        </div>
      </div>
    </Link>
  );
}
