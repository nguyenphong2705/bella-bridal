import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { serverFetch } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import type { ServiceItem } from '@/types';

export const metadata: Metadata = {
  title: 'Dịch vụ cưới cao cấp',
  description: 'Cho thuê váy cưới, may đo thiết kế riêng, chụp ảnh cưới nghệ thuật, trang điểm cô dâu và gói cưới trọn gói.',
};

export default async function ServicesPage() {
  const res = await serverFetch<{ data: ServiceItem[] }>('/services', 60);
  const services = res?.data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">BellaBridal Services</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">Dịch Vụ Cưới Cao Cấp</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">
          Giải pháp toàn diện từ váy cưới Haute Couture, trang điểm cô dâu đến nhiếp ảnh nghệ thuật.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="flex flex-col overflow-hidden rounded-3xl border border-blush-pink/60 bg-white shadow-card sm:flex-row"
          >
            <div className="relative aspect-[4/3] w-full shrink-0 bg-cream sm:aspect-auto sm:w-52">
              <Image
                src={
                  svc.image ||
                  'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80'
                }
                alt={svc.name}
                fill
                sizes="(max-width: 640px) 100vw, 220px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-charcoal">{svc.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{svc.description || svc.short_description}</p>
              </div>
              <div className="mt-5 border-t border-blush-pink/40 pt-4">
                <p className="text-sm font-semibold text-rose-gold-dark">
                  {formatCurrency(svc.price_from)} — {formatCurrency(svc.price_to)}
                </p>
                {svc.duration_note && <p className="mt-0.5 text-xs text-muted">{svc.duration_note}</p>}
                <Link href="/dat-lich" className="btn-outline mt-4 w-full justify-center py-2 text-xs">
                  <Calendar className="h-3.5 w-3.5" /> Đặt lịch tư vấn
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
