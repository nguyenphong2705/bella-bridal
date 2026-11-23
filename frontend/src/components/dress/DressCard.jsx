import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

export default function DressCard({ dress }) {
  const primaryImage =
    dress.images?.find((img) => img.is_primary)?.image_url ||
    dress.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80';

  return (
    <Link
      to={`/vay-cuoi/${dress.slug}`}
      className="group block overflow-hidden rounded-2xl border border-blush-pink/50 bg-white p-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream">
        <img
          src={primaryImage}
          alt={dress.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-ivory/90 px-3 py-1 text-[11px] font-medium tracking-wider text-charcoal backdrop-blur-sm">
          {dress.code}
        </span>
        {dress.is_featured && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-gold/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
            Nổi bật
          </span>
        )}
      </div>

      <div className="mt-4 px-1 pb-1">
        <p className="text-xs uppercase tracking-widest text-rose-gold-dark">
          {dress.category?.name || dress.silhouette}
        </p>
        <h3 className="mt-1 font-serif text-xl font-semibold text-charcoal transition-colors group-hover:text-rose-gold-dark">
          {dress.name}
        </h3>
        <div className="mt-2 flex items-baseline justify-between text-sm">
          <span className="font-medium text-charcoal">
            Thuê: <strong className="text-rose-gold-dark">{formatPrice(dress.rental_price)}</strong>
          </span>
          <span className="text-xs text-muted">{dress.silhouette}</span>
        </div>
      </div>
    </Link>
  );
}
