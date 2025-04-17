import Head from 'next/head';
import React from 'react';

function SEOHead() {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="CadexLaw" />
      <meta name="distribution" content="global" />
      <meta name="identifier-url" content="https://www.cadexlaw.com" />
      <meta name="language" content="English" />
      <meta name="classification" content="Legal Education, Case Briefs, Exam Prep" />
      <link rel="icon" href="/favicon.png" sizes="any" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="canonical" href="https://www.cadexlaw.com" />

      <title>CadexLaw – #1 Case Briefs Platform | Best Quimbee &amp; LexPlug Alternative</title>
      <meta
        name="description"
        content="CadexLaw offers 20,000+ expert case briefs, IRAC outlines, and practice exams. The top Quimbee & LexPlug alternative for law students mastering issue-spotting and exam prep."
      />
      <meta
        name="keywords"
        content="CadexLaw, case briefs, IRAC outlines, exam prep, law student study aid, Quimbee alternative, LexPlug alternative, best case briefs, legal analysis tool"
      />

      <meta property="og:title" content="CadexLaw – Case Briefs &amp; Exam Prep for Law Students" />
      <meta
        property="og:description"
        content="Discover CadexLaw’s extensive library of case briefs and practice exams—your premier alternative to Quimbee and LexPlug."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.cadexlaw.com" />
      <meta property="og:image" content="https://www.cadexlaw.com/images/favicon.png" />
      <meta property="og:site_name" content="CadexLaw" />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="CadexLaw – Case Briefs &amp; Exam Prep for Law Students" />
      <meta
        name="twitter:description"
        content="Access thousands of expertly crafted case briefs and practice exams at CadexLaw—your go‑to Quimbee & LexPlug alternative."
      />
      <meta name="twitter:image" content="https://www.cadexlaw.com/images/twitter-card.jpg" />
      <meta name="twitter:creator" content="@CadexLaw" />
      <meta name="twitter:site" content="@CadexLaw" />

      <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://www.cadexlaw.com/#website",
              "url": "https://www.cadexlaw.com",
              "name": "CadexLaw",
              "description": "CadexLaw offers expert case briefs, IRAC outlines, and practice exams as the leading Quimbee & LexPlug alternative for law students.",
              "publisher": {
                "@type": "Organization",
                "name": "CadexLaw",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.cadexlaw.com/favicon.png"
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.cadexlaw.com/search?query={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://www.cadexlaw.com/#breadcrumb",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://www.cadexlaw.com"
                }
              ]
            }
          ]
        }
        `}
      </script>
    </Head>
  );
}

export default SEOHead;
