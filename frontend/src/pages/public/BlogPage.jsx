import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import SeoHead from '../../components/seo/SeoHead';
import { PageLoader } from '../../components/common/Skeleton';
import { formatDate } from '../../utils/format';

const BLOG_CATEGORIES = [
  'Tất cả',
  'Kinh nghiệm chọn váy cưới',
  'Xu hướng váy cưới',
  'Kinh nghiệm chuẩn bị đám cưới',
  'Bí quyết trang điểm',
];

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('Tất cả');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/posts', {
        params: { category: category === 'Tất cả' ? undefined : category },
      })
      .then((res) => setPosts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <>
      <SeoHead
        title="Tạp Chí Cưới &amp; Kinh Nghiệm Chọn Váy Cưới | BellaBridal"
        description="Cẩm nang chọn váy cưới theo vóc dáng, xu hướng váy cưới mới nhất, bí quyết trang điểm cô dâu và kế hoạch chuẩn bị đám cưới."
        canonicalPath="/blog"
      />

      <section className="bg-cream py-12 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark">Bridal Journal</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Tạp Chí &amp; Kinh Nghiệm Cưới</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                category === cat
                  ? 'bg-rose-gold text-white'
                  : 'border border-blush-pink bg-white text-charcoal hover:bg-soft-pink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <PageLoader />
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
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
                  <h2 className="mt-1.5 font-serif text-2xl font-semibold text-charcoal group-hover:text-rose-gold-dark">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
                  <p className="mt-3 text-xs text-muted">{formatDate(post.published_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
