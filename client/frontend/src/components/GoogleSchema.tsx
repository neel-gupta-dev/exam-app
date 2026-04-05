"use client";

/**
 * GoogleSchema Component
 * Injects JSON-LD structured data to help Google understand the site structure
 * and potentially generate Sitelinks in search results.
 */
export default function GoogleSchema() {
  const domain = "https://vayl.in";

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

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${domain}/#software`,
    "name": "Vayl",
    "applicationCategory": "EducationApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Vayl is the high-fidelity study operating system for elite aspirants, featuring a Mistake Vault and Deep Focus Room.",
    "about": {
      "@type": "Thing",
      "description": "Academic resource management and cognitive performance tool."
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Vayl?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vayl is the 'Silent Architect' of academic success—a premium study operating system designed to help elite aspirants manage and master academic resources with surgical precision."
        }
      },
      {
        "@type": "Question",
        "name": "Does Vayl support UPSC or JEE preparation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Vayl is specifically optimized for high-stakes exams like UPSC, NEET, JEE, CAT, and GATE, providing tools for high-yield resource management."
        }
      },
      {
        "@type": "Question",
        "name": "How does the Mistake Vault work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Mistake Vault allows students to convert incorrect answers into permanent neural pathways by categorizing and revisiting critical errors structurally."
        }
      }
    ]
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${domain}/#organization`,
    "name": "Vayl",
    "url": domain,
    "logo": `${domain}/vayl-logo.png`,
    "sameAs": [
      "https://twitter.com/vayl_app",
      "https://github.com/vayl-labs"
    ],
    "description": "The elite study infrastructure for aspirants who target excellence."
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
