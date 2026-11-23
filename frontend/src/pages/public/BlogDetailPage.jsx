import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/client';
import SeoHead from '../../components/seo/SeoHead';
import { PageLoader } from '../../components/common/Skeleton';
import { formatDate } from '../../utils/format';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/posts/${slug}`)
      .then((res) => setPost(res.data.post))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl">Không tìm thấy bài viết</h1>
        <Link to="/blog" className="btn-primary mt-6">Quay lại Tạp chí</Link>
      </div>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.thumbnail,
    datePublished: post.published_at,
  };

  return (
    <>
      <SeoHead
        title={post.meta_title || `${post.title} | BellaBridal`}
        description={post.meta_description || post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
        image={post.thumbnail}
        type="article"
        schema={articleSchema}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-gold-dark hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Quay lại tạp chí cưới
        </Link>

        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-rose-gold-dark">{post.category}</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-3 text-xs text-muted">
          Đăng ngày {formatDate(post.published_at)} · {post.author?.name || 'BellaBridal Editorial'}
        </p>

        {post.thumbnail && (
          <div className="mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-blush-pink bg-cream">
            <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="mt-8 space-y-4 whitespace-pre-line text-base leading-relaxed text-charcoal/90">
          {post.content}
        </div>
      </article>
    </>
  );
}
