import Head from 'next/head';
import Script from 'next/script';
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
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="identifier-url" content="https://www.cadexlaw.com" />
      <meta name="language" content="English" />
      <meta name="classification" content="Legal Education, Law Simulation, Study Aid" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
      <link rel="icon" href="/favicon.png" sizes="any" />
      <link rel="canonical" href="https://www.cadexlaw.com" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      <title>CadexLaw - Law Student Study Aid, Legal Simulation, Court Case Practice</title>
      <meta
        name="description"
        content="CadexLaw is an innovative, AI-powered legal simulation platform tailored for law students and legal professionals. Experience realistic court scenarios, interactive mock trials, comprehensive legal training, LSAT preparation, case studies, advanced legal research tools, exam prep, and a rich library of legal resources to elevate your legal education and practice."
      />
      <meta
        name="keywords"
        content="Cadex, CadexLaw, law student study aid, legal simulation, court simulation, Quimbee, legal practice, LSAT prep, legal education, mock trials, courtroom training, legal training, bar exam prep, legal scenarios, legal technology, AI legal simulations, online law courses, virtual courtroom, legal tech, legal case simulations, law simulation software, realistic court cases, legal industry innovation, advanced legal training, legal research, case studies, interactive legal practice, exam prep, legal study resources, legal analysis, legal reasoning, legal interactive tools"
      />
      <meta property="og:title" content="CadexLaw - Law Student Study Aid, Legal Simulation, Court Case Practice" />
      <meta
        property="og:description"
        content="Discover CadexLaw: a cutting-edge legal simulation platform offering realistic court scenarios, interactive mock trials, comprehensive legal training, and an extensive library of legal resources designed for law students and professionals."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.cadexlaw.com" />
      <meta property="og:image" content="https://www.cadexlaw.com/images/og-image.jpg" />
      <meta property="og:site_name" content="CadexLaw" />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="CadexLaw - Law Student Study Aid, Legal Simulation, Court Case Practice" />
      <meta
        name="twitter:description"
        content="Enhance your legal education with CadexLaw's 50,000+ Case Briefs, interactive UX, Case Summaries, comprehensive exam preparation, and advanced legal research tools. Your ultimate legal study platform."
      />
      <meta name="twitter:image" content="https://www.cadexlaw.com/images/twitter-card.jpg" />
      <meta name="twitter:creator" content="@CadexLaw" />
      <meta name="twitter:site" content="@CadexLaw" />
      <meta itemProp="name" content="CadexLaw - Law Student Study Aid, Legal Simulation, Court Case Practice" />
      <meta
        itemProp="description"
        content="CadexLaw is an innovative legal simulation platform offering AI-powered, realistic court scenarios, interactive mock trials, LSAT prep, and a comprehensive suite of legal study resources for law students and professionals."
      />
      <meta itemProp="image" content="https://www.cadexlaw.com/images/og-image.jpg" />
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "CadexLaw",
            "url": "https://www.cadexlaw.com",
            "description": "CadexLaw is an AI-powered legal simulation platform offering realistic court cases, interactive mock trials, comprehensive legal training tools, exam prep, and a rich library of legal resources designed for law students and professionals.",
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
          }
        `}
      </script>
    </Head>
  );
}

export default SEOHead;
