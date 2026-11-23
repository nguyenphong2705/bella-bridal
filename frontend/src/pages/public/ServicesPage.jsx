import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarHeart, Clock } from 'lucide-react';
import api from '../../api/client';
import SeoHead from '../../components/seo/SeoHead';
import { PageLoader } from '../../components/common/Skeleton';
import { formatPrice } from '../../utils/format';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/services')
      .then((res) => setServices(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <>
      <SeoHead
        title="Dịch Vụ Cưới Trọn Gói &amp; Cho Thuê Váy Cưới | BellaBridal"
        description="Khám phá dịch vụ cho thuê váy cưới cao cấp, may đo thiết kế riêng, chụp ảnh cưới, trang điểm cô dâu, vest chú rể và gói cưới trọn gói."
        canonicalPath="/dich-vu"
      />

      <section className="bg-cream py-12 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Luxury Bridal Services</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Dịch Vụ Cưới BellaBridal</h1>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Chăm chút từng chi tiết cho ngày trọng đại từ váy cưới, trang điểm, chụp ảnh nghệ thuật đến gói cưới trọn gói.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        {services.map((svc, idx) => (
          <div
            key={svc.id}
            id={svc.slug}
            className={`grid items-center gap-8 rounded-3xl border border-blush-pink/60 bg-white p-6 shadow-card lg:grid-cols-2 lg:p-8`}
          >
            <div className={`aspect-[16/10] overflow-hidden rounded-2xl bg-cream ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <img src={svc.image} alt={svc.name} loading="lazy" className="h-full w-full object-cover" />
            </div>

            <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
              <h2 className="font-serif text-3xl font-semibold text-charcoal">{svc.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{svc.description}</p>

              <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl bg-cream/70 px-4 py-3 text-sm">
                <div>
                  <span className="text-xs text-muted">Chi phí tham khảo: </span>
                  <strong className="text-rose-gold-dark">
                    {formatPrice(svc.price_from)}
                    {svc.price_to ? ` – ${formatPrice(svc.price_to)}` : ''}
                  </strong>
                </div>
                {svc.duration_note && (
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Clock className="h-3.5 w-3.5 text-rose-gold" />
                    {svc.duration_note}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Link to={`/dat-lich?service_id=${svc.id}`} className="btn-primary">
                  <CalendarHeart className="h-4 w-4" />
                  Đặt lịch tư vấn dịch vụ này
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
