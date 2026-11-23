import { Helmet } from 'react-helmet-async';
import { useSite } from '../../contexts/SiteContext';

export default function SeoHead({
  title,
  description,
  canonicalPath = '/',
  image = 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1200&q=80',
  type = 'website',
  schema = null,
}) {
  const { settings } = useSite();
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bellabridal.vn';
  const fullTitle = title || settings.seo_title;
  const fullDesc = description || settings.seo_description;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;

  const defaultLocalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'BridalShop',
    name: settings.brand_name || 'BellaBridal',
    description: fullDesc,
    url: siteUrl,
    telephone: settings.hotline,
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
      addressCountry: 'VN',
    },
  };

  const schemas = Array.isArray(schema)
    ? schema
    : schema
      ? [defaultLocalBusinessSchema, schema]
      : [defaultLocalBusinessSchema];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDesc} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="BellaBridal" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      <meta name="twitter:image" content={image} />

      {settings.gsc_verification && (
        <meta name="google-site-verification" content={settings.gsc_verification} />
      )}

      {schemas.map((s, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
