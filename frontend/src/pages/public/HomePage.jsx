import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarHeart, CheckCircle2, Sparkles, Star } from 'lucide-react';
import api from '../../api/client';
import SeoHead from '../../components/seo/SeoHead';
import DressCard from '../../components/dress/DressCard';
import { DressCardSkeleton } from '../../components/common/Skeleton';
import { formatDate, formatPrice } from '../../utils/format';

const STEPS = [
  { step: '01', title: 'Đặt lịch tư vấn', desc: 'Chọn ngày và khung giờ riêng tư phù hợp với lịch trình của bạn.' },
  { step: '02', title: 'Tư vấn 1-1 cùng Stylist', desc: 'Phân tích vóc dáng, phong cách tiệc cưới và ngân sách mong muốn.' },
  { step: '03', title: 'Trải nghiệm thử váy', desc: 'Thử các thiết kế tuyển chọn trong phòng fitting sang trọng, riêng tư.' },
  { step: '04', title: 'Chỉnh sửa & Hoàn thiện', desc: 'Đo chỉnh phom dáng chuẩn xác đến từng milimet trước ngày trọng đại.' },
];

const REAL_BRIDES = [
  { img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80', alt: 'Cô dâu BellaBridal trong ngày cưới ngoài trời' },
  { img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=80', alt: 'Khoảnh khắc cô dâu thử váy tại BellaBridal' },
  { img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80', alt: 'Cặp đôi hạnh phúc trong trang phục cưới BellaBridal' },
  { img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=700&q=80', alt: 'Cô dâu rạng rỡ với váy cưới lụa Satin' },
];

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/home')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SeoHead canonicalPath="/" />

      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-blush-pink bg-soft-pink/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-rose-gold-dark">
              <Sparkles className="h-3.5 w-3.5" />
              Haute Couture Bridal Studio
            </span>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-charcoal sm:text-5xl lg:text-6xl">
              Nơi Giấc Mơ <span className="italic text-rose-gold-dark">Nàng Dâu</span> Trở Thành Hiện Thực
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
              BellaBridal mang đến những thiết kế váy cưới cao cấp được tuyển chọn và may đo tinh xảo, tôn vinh vẻ đẹp thanh lịch, lãng mạn và độc bản của riêng bạn trong ngày trọng đại.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/bo-suu-tap" className="btn-primary">
                Khám phá bộ sưu tập
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dat-lich" className="btn-outline">
                <CalendarHeart className="h-4 w-4" />
                Đặt lịch thử váy
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-blush-pink/70 pt-6">
              <div>
                <p className="font-serif text-3xl font-semibold text-rose-gold-dark">250+</p>
                <p className="text-xs text-muted">Thiết kế váy cưới</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-semibold text-rose-gold-dark">3.500+</p>
                <p className="text-xs text-muted">Cô dâu tin chọn</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-semibold text-rose-gold-dark">100%</p>
                <p className="text-xs text-muted">Tư vấn 1-1 riêng tư</p>
              </div>
            </div>
          </motion.div>

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-blush-pink bg-soft-pink shadow-luxury">
              <img
                src="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=85"
                alt="Cô dâu mặc váy cưới cao cấp tại BellaBridal Studio"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-blush-pink bg-ivory/95 p-4 shadow-luxury backdrop-blur-sm sm:block">
              <p className="font-serif text-lg font-semibold text-charcoal">Phòng Fitting Riêng Tư</p>
              <p className="text-xs text-muted">Miễn phí thử váy &amp; chỉnh sửa số đo</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Giới thiệu Studio */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Về BellaBridal</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
            Nghệ Thuật Váy Cưới Tinh Tế &amp; Cá Nhân Hóa
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Tọa lạc tại trung tâm Quận 1, BellaBridal kiến tạo không gian thử váy ấm cúng với ánh sáng tự nhiên, chất liệu ren Pháp, lụa Mikado nhập khẩu và đội ngũ Bridal Stylist tận tâm đồng hành cùng bạn.
          </p>
        </div>

        {/* 6 Danh mục nổi bật */}
        {data?.categories?.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {data.categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/bo-suu-tap?category=${cat.slug}`}
                className="group overflow-hidden rounded-2xl border border-blush-pink/60 bg-white p-2 text-center transition hover:-translate-y-1 hover:shadow-luxury"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-cream">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2.5 font-serif text-base font-semibold text-charcoal group-hover:text-rose-gold-dark">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Bộ sưu tập váy cưới nổi bật */}
      <section className="bg-cream/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Signature Collection</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Thiết Kế Váy Cưới Nổi Bật</h2>
            </div>
            <Link to="/bo-suu-tap" className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-gold-dark hover:underline">
              Xem tất cả mẫu váy <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => <DressCardSkeleton key={idx} />)
              : data?.featured_dresses?.map((dress) => <DressCard key={dress.id} dress={dress} />)}
          </div>
        </div>
      </section>

      {/* 4. Dịch vụ nổi bật */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Dịch vụ đẳng cấp</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Trải Nghiệm Cưới Toàn Diện</h2>
          </div>
          <Link to="/dich-vu" className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-gold-dark hover:underline">
            Chi tiết bảng dịch vụ <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {data?.featured_services?.map((svc) => (
            <Link
              key={svc.id}
              to={`/dich-vu#${svc.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-luxury"
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden rounded-xl bg-cream">
                  <img
                    src={svc.image}
                    alt={svc.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold text-charcoal group-hover:text-rose-gold-dark">
                  {svc.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{svc.short_description}</p>
              </div>
              <p className="mt-4 border-t border-blush-pink/40 pt-3 text-sm font-medium text-rose-gold-dark">
                Từ {formatPrice(svc.price_from)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Quy trình tư vấn và đặt lịch */}
      <section className="bg-soft-pink/45 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Quy trình chuẩn 5 sao</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Hành Trình Tìm Kiếm Chiếc Váy Trong Mơ</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <div key={item.step} className="rounded-2xl border border-blush-pink bg-ivory p-6 shadow-card">
                <span className="font-serif text-4xl font-semibold text-rose-gold/60">{item.step}</span>
                <h3 className="mt-3 font-serif text-xl font-semibold text-charcoal">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Hình ảnh khách hàng thực tế & Đánh giá */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Real Brides</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Khoảnh Khắc Hạnh Phúc Của Nàng Dâu</h2>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {REAL_BRIDES.map((b, i) => (
            <div key={i} className="aspect-[3/4] overflow-hidden rounded-2xl border border-blush-pink/60 bg-cream">
              <img src={b.img} alt={b.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
            </div>
          ))}
        </div>

        {data?.reviews?.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {data.reviews.slice(0, 3).map((rev) => (
              <div key={rev.id} className="rounded-2xl border border-blush-pink/60 bg-white p-6 shadow-card">
                <div className="flex gap-1 text-rose-gold">
                  {Array.from({ length: rev.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm italic leading-relaxed text-charcoal">“{rev.content}”</p>
                <div className="mt-4 border-t border-blush-pink/40 pt-3">
                  <p className="font-serif text-lg font-semibold text-charcoal">{rev.customer_name}</p>
                  <p className="text-xs text-muted">{rev.service_used} · {rev.wedding_date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. Tạp chí kinh nghiệm cưới */}
      {data?.latest_posts?.length > 0 && (
        <section className="bg-cream/60 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Bridal Journal</p>
                <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Cẩm Nang &amp; Kinh Nghiệm Cưới</h2>
              </div>
              <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-gold-dark hover:underline">
                Đọc thêm bài viết <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {data.latest_posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-2xl border border-blush-pink/60 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-luxury"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-cream">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium uppercase tracking-wider text-rose-gold-dark">{post.category}</span>
                    <h3 className="mt-1.5 font-serif text-xl font-semibold text-charcoal group-hover:text-rose-gold-dark">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
                    <p className="mt-3 text-xs text-muted">{formatDate(post.published_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. CTA Đặt lịch tư vấn */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blush-pink bg-gradient-to-r from-soft-pink via-cream to-ivory p-8 text-center shadow-luxury sm:p-14">
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
            Sẵn Sàng Cho Buổi Thử Váy Cưới Riêng Tư?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base">
            Đặt lịch hẹn ngay hôm nay để được chuyên viên BellaBridal tư vấn vóc dáng, trải nghiệm những thiết kế mới nhất và nhận ưu đãi đặc quyền cho cặp đôi.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link to="/dat-lich" className="btn-primary">
              <CalendarHeart className="h-4 w-4" />
              Đặt lịch thử váy ngay
            </Link>
            <Link to="/lien-he" className="btn-outline">
              <CheckCircle2 className="h-4 w-4" />
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
