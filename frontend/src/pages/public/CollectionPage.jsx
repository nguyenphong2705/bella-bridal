import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../../api/client';
import SeoHead from '../../components/seo/SeoHead';
import DressCard from '../../components/dress/DressCard';
import { DressCardSkeleton } from '../../components/common/Skeleton';

const SILHOUETTES = [
  'Công chúa (Ballgown)',
  'Chữ A (A-Line)',
  'Đuôi cá (Mermaid)',
  'Áo dài truyền thống',
];

const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: '', max: '' },
  { label: 'Dưới 10 triệu', min: '0', max: '10000000' },
  { label: '10 - 20 triệu', min: '10000000', max: '20000000' },
  { label: 'Trên 20 triệu', min: '20000000', max: '' },
];

export default function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [dresses, setDresses] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const activeCategory = searchParams.get('category') || '';
  const activeSilhouette = searchParams.get('silhouette') || '';
  const activeSort = searchParams.get('sort') || 'featured';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (searchInput.trim()) next.set('search', searchInput.trim());
      else next.delete('search');
      next.delete('page');
      setSearchParams(next, { replace: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    api
      .get('/dresses', {
        params: {
          category: activeCategory || undefined,
          silhouette: activeSilhouette || undefined,
          min_price: minPrice || undefined,
          max_price: maxPrice || undefined,
          search: searchParams.get('search') || undefined,
          sort: activeSort,
          page,
          per_page: 9,
        },
      })
      .then((res) => {
        setDresses(res.data.data || []);
        setMeta({
          current_page: res.data.current_page || 1,
          last_page: res.data.last_page || 1,
          total: res.data.total || 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, activeSilhouette, minPrice, maxPrice, activeSort, page, searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const handlePriceChange = (range) => {
    const next = new URLSearchParams(searchParams);
    if (range.min) next.set('min_price', range.min);
    else next.delete('min_price');
    if (range.max) next.set('max_price', range.max);
    else next.delete('max_price');
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <>
      <SeoHead
        title="Bộ Sưu Tập Váy Cưới Cao Cấp | BellaBridal Studio"
        description="Khám phá bộ sưu tập váy cưới công chúa, váy chữ A, váy đuôi cá, váy tối giản và áo dài cưới truyền thống tại BellaBridal."
        canonicalPath="/bo-suu-tap"
      />

      <section className="bg-cream py-12 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Bridal Collection</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Bộ Sưu Tập Váy Cưới</h1>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Tuyển chọn hơn 250+ thiết kế váy cưới tinh xảo từ phom dáng cổ điển đến tối giản hiện đại.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParam('category', '')}
            className={`rounded-full px-4 py-2 text-xs font-medium transition ${
              !activeCategory ? 'bg-rose-gold text-white' : 'border border-blush-pink bg-white text-charcoal hover:bg-soft-pink'
            }`}
          >
            Tất cả danh mục
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateParam('category', cat.slug)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                activeCategory === cat.slug
                  ? 'bg-rose-gold text-white'
                  : 'border border-blush-pink bg-white text-charcoal hover:bg-soft-pink'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="mt-6 grid gap-3 rounded-2xl border border-blush-pink/60 bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm tên váy, mã BB-..."
              className="luxury-input pl-9"
            />
          </div>

          <select
            value={activeSilhouette}
            onChange={(e) => updateParam('silhouette', e.target.value)}
            className="luxury-input"
            aria-label="Lọc theo kiểu dáng"
          >
            <option value="">Tất cả kiểu dáng</option>
            {SILHOUETTES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={`${minPrice}-${maxPrice}`}
            onChange={(e) => {
              const found = PRICE_RANGES.find((r) => `${r.min}-${r.max}` === e.target.value);
              if (found) handlePriceChange(found);
            }}
            className="luxury-input"
            aria-label="Lọc theo mức giá"
          >
            {PRICE_RANGES.map((r) => (
              <option key={r.label} value={`${r.min}-${r.max}`}>{r.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-rose-gold" />
            <select
              value={activeSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="luxury-input"
              aria-label="Sắp xếp"
            >
              <option value="featured">Nổi bật nhất</option>
              <option value="price_asc">Giá thuê: Thấp đến cao</option>
              <option value="price_desc">Giá thuê: Cao đến thấp</option>
              <option value="popular">Xem nhiều nhất</option>
            </select>
          </div>
        </div>

        <p className="mt-5 text-xs text-muted">Hiển thị {dresses.length} / {meta.total} mẫu váy cưới</p>

        {/* Grid */}
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => <DressCardSkeleton key={idx} />)
            : dresses.map((dress) => <DressCard key={dress.id} dress={dress} />)}
        </div>

        {!loading && dresses.length === 0 && (
          <div className="mt-10 rounded-2xl border border-blush-pink bg-cream/60 p-10 text-center">
            <p className="font-serif text-2xl text-charcoal">Chưa tìm thấy mẫu váy phù hợp</p>
            <p className="mt-2 text-sm text-muted">Hãy thử bỏ bớt bộ lọc hoặc liên hệ Stylist BellaBridal để được gợi ý riêng.</p>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: meta.last_page }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', String(p));
                    setSearchParams(next);
                  }}
                  className={`h-9 w-9 rounded-lg text-sm font-medium ${
                    p === meta.current_page
                      ? 'bg-rose-gold text-white'
                      : 'border border-blush-pink bg-white text-charcoal hover:bg-soft-pink'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
