import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { BlogPost } from '@/types';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await serverFetch<{ data: BlogPost }>(`/posts/${slug}`, 60);
  const post = res?.data;
  if (!post) return { title: 'Không tìm thấy bài viết' };
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || '',
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await serverFetch<{ data: BlogPost }>(`/posts/${slug}`, 60);
  if (!res?.data) notFound();
  const post = res.data;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/tin-tuc" className="text-xs font-medium text-rose-gold-dark hover:underline">
        ← Quay lại Tạp chí cưới
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-rose-gold-dark">
        {post.category} • {formatDate(post.published_at)}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-charcoal sm:text-5xl">{post.title}</h1>

      {post.thumbnail && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl border border-blush-pink/60">
          <Image src={post.thumbnail} alt={post.title} fill priority sizes="800px" className="object-cover" />
        </div>
      )}

      <div className="mt-8 space-y-4 whitespace-pre-line text-base leading-relaxed text-charcoal/90">{post.content}</div>
    </article>
  );
}
