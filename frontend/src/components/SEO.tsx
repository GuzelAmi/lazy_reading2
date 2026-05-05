import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description = "Читайте книги онлайн с определением незнакомых слов через нейросеть.", 
  canonical, 
  ogImage = "/og-image.png",
  noindex = false 
}) => {
  const fullTitle = `${title} | Lazy Reading`;
  const canonicalUrl = canonical ? `https://lazyreading.ru${canonical}` : 'https://lazyreading.ru/';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
};