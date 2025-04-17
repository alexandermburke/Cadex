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
        <title>CadexLaw – 20,000+ Case Briefs for Cold Calls, IRAC & Bar Exam Prep</title>
        <meta
          name="description"
          content="CadexLaw is the #1 Law School Tool, offering 20,000+ expertly crafted case briefs, IRAC issue‑spotter outlines, cold call preparation, bar exam outlines, and practice exams for law students."
        />
        <meta
          name="keywords"
          content="law school case briefs, cold call preparation, IRAC outlines, issue spotting, bar exam prep, bar outlines, case brief library, legal study aids, Quimbee alternative, LexPlug alternative"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://www.cadexlaw.com" />

        <meta property="og:title" content="CadexLaw – Case Briefs & Bar Exam Prep for Law Students" />
        <meta
          property="og:description"
          content="Access 20,000+ case briefs, IRAC outlines, cold call prep, and bar outlines at CadexLaw—your premier alternative to Quimbee and LexPlug."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.cadexlaw.com" />
        <meta property="og:image" content="https://www.cadexlaw.com/images/og-image.jpg" />
        <meta property="og:site_name" content="CadexLaw" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@CadexLaw" />
        <meta name="twitter:creator" content="@CadexLaw" />
        <meta name="twitter:title" content="CadexLaw – Case Briefs & Bar Exam Prep for Law Students" />
        <meta
          name="twitter:description"
          content="Discover 20,000+ case briefs, IRAC outlines, cold call and bar exam prep at CadexLaw—your ultimate Quimbee & LexPlug alternative."
        />
        <meta name="twitter:image" content="https://www.cadexlaw.com/images/twitter-card.jpg" />
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
