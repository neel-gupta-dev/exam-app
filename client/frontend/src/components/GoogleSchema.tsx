"use client";

/**
 * GoogleSchema Component
 * Injects JSON-LD structured data to help Google understand the site structure
 * and potentially generate Sitelinks in search results.
 */
export default function GoogleSchema() {
  const domain = "https://vayl-app.vercel.app";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Vayl",
    "alternateName": "Vault",
    "url": domain,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${domain}/resources?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const navSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Sign in to Vault",
        "url": `${domain}/login`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog & Strategy",
        "url": `${domain}/blogs`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Our Mission",
        "url": `${domain}/about`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Contact Support",
        "url": `${domain}/contact`
      }
    ]
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vayl",
    "url": domain,
    "logo": `${domain}/vayl-logo.png`,
    "sameAs": [
      "https://twitter.com/vayl_app", // Placeholder placeholders for authority
      "https://github.com/vayl-labs"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </>
  );
}
