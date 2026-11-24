import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { BlogPost } from '@/types';

export const metadata: Metadata = {
  title: 'Tạp chí cưới & Cẩm nang cô dâu',
  description: 'Kinh nghiệm chọn váy cưới, xu hướng bridal 2026 và bí quyết chuẩn bị ngày trọng đại.',
};

export default async function BlogPage() {
  const res = await serverFetch<{ data: BlogPost[] }>('/posts', 60);
  const posts = res?.data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">BellaBridal Journal</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">Tạp Chí Cưới</h1>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="p-6">
              <div className="flex items-center justify-between text-xs text-rose-gold-dark">
                <span>{post.category}</span>
                <span className="text-muted">{formatDate(post.published_at)}</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-charcoal group-hover:text-rose-gold-dark">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
