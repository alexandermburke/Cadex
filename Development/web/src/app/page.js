import Head from "next/head"
import CoolLayout from "@/components/CoolLayout"
import Hero from "@/components/Hero"
import Main from "@/components/Main"
import Product from "@/components/Product"
import Benefits from "@/components/Home"

export default function Home() {
  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>CadexLaw – 20,000+ Case Briefs & IRAC Outlines for U.S. Law Students</title>
        <meta
          name="description"
          content="CadexLaw offers 20,000+ expertly crafted law school case briefs, IRAC issue‑spotter outlines, free case brief examples, cold call prep, bar exam outlines, and comprehensive study aids designed for U.S. law students."
        />
        <meta
          name="keywords"
          content="law school case briefs, free case briefs, IRAC outlines, issue spotting, cold call preparation, bar exam prep, bar outlines, case brief library, study aids"
        />
        <link rel="canonical" href="https://www.cadexlaw.com" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="CadexLaw – Case Briefs & IRAC Outlines for Law Students" />
        <meta
          property="og:description"
          content="Get instant access to thousands of case briefs, IRAC outlines, free case summaries, cold call & bar exam prep at CadexLaw—the leading resource for law students."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.cadexlaw.com" />
        <meta property="og:image" content="https://www.cadexlaw.com/images/og-image.jpg" />
        <meta property="og:site_name" content="CadexLaw" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@CadexLaw" />
        <meta name="twitter:creator" content="@CadexLaw" />
        <meta name="twitter:title" content="CadexLaw – Case Briefs & IRAC Outlines" />
        <meta
          name="twitter:description"
          content="Discover thousands of case briefs, IRAC issue‑spotter outlines, free case brief examples, and cold call prep at CadexLaw—the premier law school study aid."
        />
        <meta name="twitter:image" content="https://www.cadexlaw.com/images/twitter-card.jpg" />

        {/* JSON-LD Structured Data */}
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
                  "description": "CadexLaw provides 20,000+ case briefs, IRAC outlines, free case summaries, cold call and bar exam prep customized for U.S. law students.",
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
            }
          `}
        </script>
      </Head>
      <CoolLayout>
        <Main>
          <Hero />
          <Product />
          <Benefits />
        </Main>
      </CoolLayout>
    </>
  )
}
