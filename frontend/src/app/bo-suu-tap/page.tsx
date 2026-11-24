'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import DressCard from '@/components/dress/DressCard';
import { apiClient } from '@/lib/api';
import type { Dress, DressCategory } from '@/types';

const TIER_META: Record<string, { title: string; subtitle: string; range: string }> = {
  'whispers-of-love': {
    title: 'Whispers of Love',
    subtitle: 'Những thiết kế váy cưới tinh khôi, nhẹ nhàng với mức giá thuê dưới 10 triệu đồng.',
    range: 'under-10',
  },
  'timeless-grace': {
    title: 'Timeless Grace',
    subtitle: 'Vẻ đẹp thanh lịch vượt thời gian với chất liệu ren Pháp & lụa cao cấp (10 – 20 triệu đồng).',
    range: '10-20',
  },
  'royal-couture': {
    title: 'Royal Couture',
    subtitle: 'Tuyệt tác Haute Couture xa hoa, đính kết thủ công hàng trăm giờ (từ 20 triệu đồng).',
    range: 'over-20',
  },
};

function CollectionContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category') || '';
  const urlTier = searchParams.get('tier') || '';

  const [categories, setCategories] = useState<DressCategory[]>([]);
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [category, setCategory] = useState(urlCategory);
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState(TIER_META[urlTier]?.range || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    setPriceRange(TIER_META[urlTier]?.range || '');
  }, [urlTier]);

  useEffect(() => {
    apiClient.get<{ data: DressCategory[] }>('/categories').then((res) => setCategories(res.data.data || []));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      let min_price: string | undefined;
      let max_price: string | undefined;
      if (priceRange === 'under-10') {
        max_price = '9999999';
      } else if (priceRange === '10-20') {
        min_price = '10000000';
        max_price = '19999999';
      } else if (priceRange === 'over-20') {
        min_price = '20000000';
      }
      apiClient
        .get<{ data: Dress[] }>('/dresses', {
          params: {
            category: category || undefined,
            search: search || undefined,
            min_price,
            max_price,
          },
        })
        .then((res) => setDresses(res.data.data || []))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [category, search, priceRange]);

  const activeTier =
    priceRange === 'under-10'
      ? TIER_META['whispers-of-love']
      : priceRange === '10-20'
      ? TIER_META['timeless-grace']
      : priceRange === 'over-20'
      ? TIER_META['royal-couture']
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">BellaBridal Collection</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
          {activeTier ? activeTier.title : 'Bộ Sưu Tập Váy Cưới'}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">
          {activeTier
            ? activeTier.subtitle
            : 'Tất cả thiết kế đều được tuyển chọn chất liệu thượng hạng và chỉnh sửa vừa vặn theo số đo cô dâu.'}
        </p>
      </div>

      {/* Filters */}
      <div className="mt-10 grid gap-4 rounded-2xl border border-blush-pink/60 bg-white p-5 shadow-card md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên váy, mã váy, chất liệu..."
            className="luxury-input pl-10"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="luxury-input">
          <option value="">Tất cả kiểu dáng</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="luxury-input">
          <option value="">Mọi mức giá thuê</option>
          <option value="under-10">Whispers of Love (Dưới 10 triệu)</option>
          <option value="10-20">Timeless Grace (10 – 20 triệu)</option>
          <option value="over-20">Royal Couture (Từ 20 triệu)</option>
        </select>
      </div>

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[460px] animate-pulse rounded-2xl bg-cream" />
          ))}
        </div>
      ) : dresses.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-blush-pink/60 bg-white p-12 text-center text-muted">
          Không tìm thấy mẫu váy phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dresses.map((d) => (
            <DressCard key={d.id} dress={d} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-center text-muted">Đang tải bộ sưu tập...</div>}>
      <CollectionContent />
    </Suspense>
  );
}
