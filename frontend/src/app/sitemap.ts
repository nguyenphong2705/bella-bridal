import type { MetadataRoute } from 'next';
import { serverFetch } from '@/lib/api';
import type { BlogPost, Dress } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const staticRoutes = ['', '/bo-suu-tap', '/dich-vu', '/dat-lich', '/ve-chung-toi', '/tin-tuc', '/lien-he'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    })
  );

  const dressesRes = await serverFetch<{ data: Dress[] }>('/dresses', 300);
  const dressRoutes = (dressesRes?.data || []).map((d) => ({
    url: `${baseUrl}/bo-suu-tap/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const postsRes = await serverFetch<{ data: BlogPost[] }>('/posts', 300);
  const postRoutes = (postsRes?.data || []).map((p) => ({
    url: `${baseUrl}/tin-tuc/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...dressRoutes, ...postRoutes];
}
