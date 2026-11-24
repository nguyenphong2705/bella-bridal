import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, CheckCircle2, Film, Sparkles } from 'lucide-react';
import DressCard from '@/components/dress/DressCard';
import { serverFetch } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import type { Dress } from '@/types';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await serverFetch<{ data: Dress }>(`/dresses/${slug}`, 60);
  const dress = res?.data;
  if (!dress) return { title: 'Không tìm thấy mẫu váy' };

  return {
    title: dress.meta_title || `${dress.name} | Thuê váy cưới BellaBridal`,
    description: dress.meta_description || dress.description || '',
    openGraph: {
      title: dress.name,
      description: dress.description || '',
      images: dress.images?.[0]?.image_url ? [dress.images[0].image_url] : [],
    },
  };
}

export default async function DressDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await serverFetch<{ data: Dress; related: Dress[] }>(`/dresses/${slug}`, 30);
  if (!res?.data) notFound();

  const dress = res.data;
  const related = res.related || [];
  const images = dress.images || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 text-xs text-muted">
        <Link href="/" className="hover:text-rose-gold-dark">Trang chủ</Link> /{' '}
        <Link href="/bo-suu-tap" className="hover:text-rose-gold-dark">Bộ sưu tập</Link> /{' '}
        <span className="text-charcoal">{dress.name}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Gallery & Lookbook Video */}
        <div className="space-y-4 lg:col-span-7">
          {images[0] && (
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-blush-pink/60 bg-cream shadow-luxury">
              <Image
                src={images[0].image_url}
                alt={images[0].alt_text || dress.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          )}

          {images.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {images.slice(1).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-blush-pink/60 bg-cream"
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || dress.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 30vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {dress.video_url && (
            <div className="overflow-hidden rounded-2xl border border-blush-pink/60 bg-charcoal p-4 text-white">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-blush-pink">
                <Film className="h-4 w-4" /> Lookbook Video Độ Phân Giải Cao
              </div>
              <video src={dress.video_url} controls playsInline muted className="aspect-video w-full rounded-xl object-cover" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-blush-pink/60 bg-white p-6 shadow-card sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-soft-pink px-3 py-1 text-xs font-medium text-rose-gold-dark">
              <Sparkles className="h-3.5 w-3.5" /> {dress.category?.name || dress.silhouette} • {dress.code}
            </span>
            <h1 className="mt-4 font-serif text-3xl font-semibold text-charcoal sm:text-4xl">{dress.name}</h1>

            <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-cream/70 p-4">
              <div>
                <span className="text-xs text-muted">Giá thuê</span>
                <p className="font-serif text-2xl font-semibold text-rose-gold-dark">
                  {formatCurrency(dress.rental_price)}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted">Giá may đo sở hữu</span>
                <p className="font-serif text-2xl font-semibold text-charcoal">{formatCurrency(dress.sale_price)}</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted">{dress.description}</p>

            <dl className="mt-6 space-y-2.5 border-t border-blush-pink/50 pt-5 text-sm">
              {dress.silhouette && (
                <div className="flex justify-between">
                  <dt className="text-muted">Phom dáng</dt>
                  <dd className="font-medium text-charcoal">{dress.silhouette}</dd>
                </div>
              )}
              {dress.material && (
                <div className="flex justify-between gap-4 text-right">
                  <dt className="shrink-0 text-muted">Chất liệu</dt>
                  <dd className="font-medium text-charcoal">{dress.material}</dd>
                </div>
              )}
              {dress.color && (
                <div className="flex justify-between">
                  <dt className="text-muted">Màu sắc</dt>
                  <dd className="font-medium text-charcoal">{dress.color}</dd>
                </div>
              )}
              {dress.style && (
                <div className="flex justify-between">
                  <dt className="text-muted">Phong cách</dt>
                  <dd className="font-medium text-charcoal">{dress.style}</dd>
                </div>
              )}
            </dl>

            <ul className="mt-6 space-y-2 text-xs text-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-rose-gold" /> Miễn phí chỉnh sửa theo số đo cô dâu
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-rose-gold" /> Tư vấn 1-1 cùng Bridal Stylist trong phòng VIP
              </li>
            </ul>

            <Link href={`/dat-lich?dress=${dress.id}`} className="btn-primary mt-6 w-full justify-center">
              <Calendar className="h-4 w-4" />
              <span>Đặt lịch thử mẫu váy này</span>
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-blush-pink/60 pt-12">
          <h2 className="font-serif text-3xl font-semibold text-charcoal">Các Mẫu Váy Tương Tự</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <DressCard key={r.id} dress={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
