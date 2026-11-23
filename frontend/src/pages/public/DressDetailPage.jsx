import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarHeart, ChevronRight, Sparkles } from 'lucide-react';
import api from '../../api/client';
import SeoHead from '../../components/seo/SeoHead';
import DressCard from '../../components/dress/DressCard';
import { PageLoader } from '../../components/common/Skeleton';
import { formatPrice } from '../../utils/format';

export default function DressDetailPage() {
  const { slug } = useParams();
  const [dress, setDress] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/dresses/${slug}`)
      .then((res) => {
        setDress(res.data.dress);
        setRelated(res.data.related || []);
        const firstImg = res.data.dress?.images?.[0]?.image_url || '';
        setActiveImage(firstImg);
      })
      .catch(() => setDress(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!dress) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold">Không tìm thấy mẫu váy cưới</h1>
        <Link to="/bo-suu-tap" className="btn-primary mt-6">Quay lại bộ sưu tập</Link>
      </div>
    );
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: dress.name,
    sku: dress.code,
    description: dress.description,
    image: dress.images?.map((i) => i.image_url),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: dress.rental_price,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <SeoHead
        title={dress.meta_title || `${dress.name} | Thuê váy cưới BellaBridal`}
        description={dress.meta_description || dress.description}
        canonicalPath={`/vay-cuoi/${dress.slug}`}
        image={activeImage}
        schema={productSchema}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted">
          <Link to="/" className="hover:text-rose-gold-dark">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/bo-suu-tap" className="hover:text-rose-gold-dark">Bộ sưu tập</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-charcoal">{dress.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="aspect-[3/4] overflow-hidden rounded-3xl border border-blush-pink bg-cream shadow-card">
              <img src={activeImage} alt={dress.name} className="h-full w-full object-cover" />
            </div>
            {dress.images?.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {dress.images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(img.image_url)}
                    className={`aspect-[3/4] overflow-hidden rounded-xl border-2 transition ${
                      activeImage === img.image_url ? 'border-rose-gold' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_url} alt={img.alt_text || dress.name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-soft-pink px-3.5 py-1 text-xs font-medium text-rose-gold-dark">
              <Sparkles className="h-3.5 w-3.5" />
              Mã sản phẩm: {dress.code}
            </span>
            <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal">{dress.name}</h1>
            <p className="mt-1 text-sm text-rose-gold-dark">{dress.category?.name}</p>

            <div className="mt-6 rounded-2xl border border-blush-pink/70 bg-cream/60 p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">Giá thuê tham khảo</span>
                <span className="font-serif text-3xl font-semibold text-rose-gold-dark">
                  {formatPrice(dress.rental_price)}
                </span>
              </div>
              {dress.sale_price && (
                <div className="mt-2 flex items-baseline justify-between border-t border-blush-pink/40 pt-2 text-sm">
                  <span className="text-muted">Giá may đo sở hữu riêng</span>
                  <span className="font-medium text-charcoal">{formatPrice(dress.sale_price)}</span>
                </div>
              )}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-charcoal/90 sm:text-base">{dress.description}</p>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-blush-pink/60 py-5 text-sm">
              <div>
                <dt className="text-xs text-muted">Kiểu dáng</dt>
                <dd className="mt-1 font-medium text-charcoal">{dress.silhouette}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phong cách</dt>
                <dd className="mt-1 font-medium text-charcoal">{dress.style}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Chất liệu</dt>
                <dd className="mt-1 font-medium text-charcoal">{dress.material}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Màu sắc</dt>
                <dd className="mt-1 font-medium text-charcoal">{dress.color}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={`/dat-lich?dress_id=${dress.id}`} className="btn-primary flex-1 justify-center">
                <CalendarHeart className="h-4 w-4" />
                Đặt lịch thử mẫu váy này
              </Link>
              <Link to="/lien-he" className="btn-outline">
                Tư vấn thêm
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16 border-t border-blush-pink/60 pt-12">
            <h2 className="font-serif text-3xl font-semibold text-charcoal">Thiết Kế Tương Tự</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <DressCard key={item.id} dress={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
