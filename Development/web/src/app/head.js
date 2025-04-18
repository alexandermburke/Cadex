// app/head.js
import Script from "next/script";

export default function Head() {
  return (
    <>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      <title>CadexLaw – Law School Case Briefs, Outlines &amp; Exam Prep</title>
      <meta
        name="description"
        content="Affordable legal study tools for law students. Access 20,000+ case briefs, 1L course outlines, practice exams and more with CadexLaw – study smarter and excel in law school."
      />
      <meta
        name="keywords"
        content="law school case briefs, law school outlines, free law school case briefs, law school practice exams, free law school outlines, law school study aids, Contracts practice exam questions, Torts case briefs, 1L case briefs, 1L law school outlines, 1L practice exams"
      />
      <link rel="canonical" href="https://www.cadexlaw.com" />

      {/* Open Graph */}
      <meta
        property="og:title"
        content="CadexLaw – Law School Case Briefs, Outlines &amp; Exam Prep"
      />
      <meta
        property="og:description"
        content="Affordable legal study tools for law students. Access 20,000+ case briefs, 1L course outlines, practice exams and more with CadexLaw – study smarter and excel in law school."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.cadexlaw.com" />
      <meta
        property="og:image"
        content="https://www.cadexlaw.com/images/og-image.jpg"
      />
      <meta property="og:site_name" content="CadexLaw" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@CadexLaw" />
      <meta name="twitter:creator" content="@CadexLaw" />
      <meta
        name="twitter:title"
        content="CadexLaw – Law School Case Briefs, Outlines &amp; Exam Prep"
      />
      <meta
        name="twitter:description"
        content="Affordable legal study tools for law students. Access 20,000+ case briefs, 1L course outlines, practice exams and more with CadexLaw – study smarter and excel in law school."
      />
      <meta
        name="twitter:image"
        content="https://www.cadexlaw.com/images/twitter-card.jpg"
      />

      <Script id="ld-json" type="application/ld+json">
        {`{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.cadexlaw.com/#website",
      "url": "https://www.cadexlaw.com",
      "name": "CadexLaw",
      "description": "Affordable legal study tools for law students. Access 20,000+ case briefs, 1L course outlines, practice exams and more with CadexLaw – study smarter and excel in law school.",
      "publisher": {
        "@type": "Organization",
        "name": "CadexLaw",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.cadexlaw.com/favicon.ico"
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
}`}
      </Script>
    </>
  );
}
