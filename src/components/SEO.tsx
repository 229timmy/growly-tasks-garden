import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  schema?: object;
}

export function SEO({
  title = 'Yield GT - Plant Management and Grow Tracking',
  description = 'Professional plant management and grow tracking platform. Monitor growth, track tasks, and optimize your cultivation process.',
  canonical,
  image = '/og-image.png',
  type = 'website',
  publishedAt,
  schema,
}: SEOProps) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://yieldgt.com';
  const fullTitle = title.includes('Yield GT') ? title : `${title} | Yield GT`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}

      {/* OpenGraph Tags */}
      <meta property="og:site_name" content="Yield GT" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {canonical && <meta property="og:url" content={`${siteUrl}${canonical}`} />}
      <meta property="og:image" content={`${siteUrl}${image}`} />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
} 