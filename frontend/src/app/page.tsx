import Image from 'next/image';
import Link from 'next/link';
import { Calendar, CheckCircle2, Film, Sparkles, Star } from 'lucide-react';
import DressCard from '@/components/dress/DressCard';
import { serverFetch } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import type { BlogPost, Dress, DressCategory, ReviewItem, ServiceItem, SiteSettings } from '@/types';

interface HomePayload {
  categories: DressCategory[];
  featured_dresses: Dress[];
  services: ServiceItem[];
  reviews: ReviewItem[];
  posts: BlogPost[];
  settings: SiteSettings;
}

export default async function HomePage() {
  const data = await serverFetch<HomePayload>('/home', 30);
  const categories = data?.categories || [];
  const featuredDresses = data?.featured_dresses || [];
  const services = data?.services || [];
  const reviews = data?.reviews || [];
  const posts = data?.posts || [];
  const lookbookVideo =
    data?.settings?.lookbook_video_url ||
    'https://assets.mixkit.co/videos/preview/mixkit-bride-in-a-wedding-dress-posing-42874-large.mp4';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BridalShop',
    name: data?.settings?.brand_name || 'BellaBridal Studio',
    description: data?.settings?.seo_description || 'Studio áo cưới cao cấp hàng đầu tại TP.HCM.',
    telephone: data?.settings?.hotline || '0901 234 567',
    address: {
      '@type': 'PostalAddress',
      streetAddress: data?.settings?.address || '128 Đồng Khởi, Quận 1, TP. Hồ Chí Minh',
      addressLocality: 'Ho Chi Minh City',
      addressCountry: 'VN',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero Section — Nền trắng ngà & kem ấm (60%) giúp ảnh cưới nổi bật */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ivory via-cream/60 to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lavender-deep bg-soft-lavender px-3.5 py-1.5 text-xs font-semibold tracking-wider text-plum">
              <Sparkles className="h-3.5 w-3.5" /> HAUTE COUTURE BRIDAL 2026
            </span>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-charcoal sm:text-5xl lg:text-6xl">
              Vẻ Đẹp Tinh Khôi Cho Ngày Trọng Đại
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
              Khám phá hơn 250+ tuyệt tác váy cưới nhập khẩu và thiết kế độc bản tại BellaBridal. Trải nghiệm thử váy
              riêng tư 1-1 cùng Bridal Stylist với hệ thống đặt lịch thời gian thực.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dat-lich" className="btn-primary">
                <Calendar className="h-4 w-4" />
                <span>Đặt lịch thử váy ngay</span>
              </Link>
              <Link href="/bo-suu-tap" className="btn-outline">
                <span>Xem bộ sưu tập</span>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-blush-pink/60 pt-6">
              <div>
                <p className="font-serif text-2xl font-semibold text-charcoal">250+</p>
                <p className="text-xs text-muted">Thiết kế độc quyền</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-semibold text-charcoal">5.000+</p>
                <p className="text-xs text-muted">Cô dâu hạnh phúc</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-semibold text-charcoal">1 - 1</p>
                <p className="text-xs text-muted">Phòng thử VIP riêng tư</p>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-blush-pink/60 shadow-luxury">
            <Image
              src="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=85"
              alt="BellaBridal Luxury Wedding Dress"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Lookbook Video Showcase — Khối phụ tím nhạt dịu */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 rounded-3xl border border-lavender-deep bg-soft-lavender/50 p-6 sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-plum">
              <Film className="h-4 w-4" /> Lookbook Điện Ảnh HD
            </span>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-charcoal sm:text-4xl">
              Chuyển Động Mềm Mại Trên Từng Thước Vải
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Chiêm ngưỡng phom dáng corset chuẩn xác, độ bồng bềnh của voan lưới Pháp và ánh pha lê Swarovski qua
              video Lookbook độ phân giải cao.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-charcoal">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-rose-gold" />
                <span>Tối ưu hóa hình ảnh & video tải siêu tốc</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-rose-gold" />
                <span>Chỉnh sửa số đo vừa vặn miễn phí 100%</span>
              </li>
            </ul>
            <Link href="/bo-suu-tap" className="btn-primary mt-6">
              Khám phá Lookbook đầy đủ
            </Link>
          </div>
          <div className="lg:col-span-7">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-blush-pink/60 bg-charcoal shadow-luxury">
              <video
                src={lookbookVideo}
                autoPlay
                muted
                loop
                playsInline
                controls
                poster="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dresses */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">Bộ sưu tập 2026</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-charcoal sm:text-4xl">
              Tuyệt Tác Váy Cưới Nổi Bật
            </h2>
          </div>
          <Link href="/bo-suu-tap" className="text-sm font-medium text-rose-gold-dark hover:underline">
            Xem tất cả váy cưới →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDresses.map((dress, idx) => (
            <DressCard key={dress.id} dress={dress} priority={idx < 3} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-cream/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">Phong cách đa dạng</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-charcoal sm:text-4xl">
              6 Dòng Váy Cưới Đặc Trưng
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/bo-suu-tap?category=${cat.slug}`}
                className="group relative flex h-64 items-end overflow-hidden rounded-2xl border border-blush-pink/60 shadow-card"
              >
                <Image
                  src={
                    cat.image ||
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80'
                  }
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent" />
                <div className="relative p-5 text-white">
                  <h3 className="font-serif text-2xl font-semibold">{cat.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-white/85">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">Dịch vụ chuyên biệt</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-charcoal sm:text-4xl">
              Trải Nghiệm Cưới Hoàn Hảo
            </h2>
          </div>
          <Link href="/dich-vu" className="text-sm font-medium text-rose-gold-dark hover:underline">
            Xem bảng giá dịch vụ →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((svc) => (
            <div
              key={svc.id}
              className="flex flex-col justify-between rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card"
            >
              <div>
                <h3 className="font-serif text-xl font-semibold text-charcoal">{svc.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{svc.short_description}</p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-blush-pink/40 pt-4 text-sm">
                <span className="font-semibold text-rose-gold-dark">Từ {formatCurrency(svc.price_from)}</span>
                <Link href="/dat-lich" className="text-xs font-medium text-charcoal hover:text-rose-gold-dark">
                  Tư vấn ngay →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews — Khối phụ hồng nhạt xen kẽ */}
      {reviews.length > 0 && (
        <section className="bg-soft-pink/55 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-serif text-3xl font-semibold text-charcoal sm:text-4xl">
              Cảm Nhận Từ Các Cặp Đôi
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card">
                  <div className="flex gap-1 text-rose-gold">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm italic leading-relaxed text-charcoal">“{rev.content}”</p>
                  <div className="mt-5 border-t border-blush-pink/40 pt-3">
                    <p className="font-serif text-lg font-semibold text-charcoal">{rev.customer_name}</p>
                    <p className="text-xs text-muted">
                      {rev.service_used} {rev.wedding_date ? `• ${rev.wedding_date}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">Tạp chí cưới</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-charcoal sm:text-4xl">
                Cẩm Nang Dành Cho Cô Dâu
              </h2>
            </div>
            <Link href="/tin-tuc" className="text-sm font-medium text-rose-gold-dark hover:underline">
              Đọc thêm bài viết →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/tin-tuc/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-blush-pink/60 bg-white shadow-card"
              >
                <div className="relative aspect-[16/10] w-full bg-cream">
                  <Image
                    src={
                      post.thumbnail ||
                      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80'
                    }
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium text-rose-gold-dark">{post.category}</span>
                  <h3 className="mt-1.5 font-serif text-xl font-semibold text-charcoal group-hover:text-rose-gold-dark">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
