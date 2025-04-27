import { getDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import CaseSummaries from '@/components/casebriefs/CaseSummaries'

export async function generateMetadata({ params }) {
  const caseId = params?.caseId
  if (!caseId) {
    return {
      title: "CadexLaw – Case Brief Summaries & IRAC Outlines",
      description:
        "Explore thousands of case brief summaries, IRAC issue‑spotter outlines, and in‑depth legal analysis on CadexLaw.",
      keywords:
        "case brief summaries, IRAC outlines, issue spotting, legal analysis, case law, CadexLaw, how to write a case brief",
      alternates: { canonical: "https://www.cadexlaw.com/casebriefs/summaries" },
      icons: '/favicon.png',
      openGraph: {
        title: "CadexLaw – Case Brief Summaries & IRAC Outlines",
        description:
          "Discover expertly crafted case brief summaries and IRAC outlines with detailed legal analysis on CadexLaw.",
        url: "https://www.cadexlaw.com/casebriefs/summaries",
        type: "website",
        site_name: "CadexLaw",
      },
      twitter: {
        card: "summary_large_image",
        title: "CadexLaw – Case Brief Summaries & IRAC Outlines",
        description:
          "Access thousands of case brief summaries and IRAC issue‑spotter outlines on CadexLaw.",
      },
    }
  }

  const docRef = doc(db, 'capCases', caseId)
  const docSnap = await getDoc(docRef)

  let title = "CadexLaw – Case Brief Summary"
  let description =
    "View the case brief summary on CadexLaw with key legal details: rule of law, facts, issue, holding, reasoning, and dissent."
  let caseName = ""
  let jurisdiction = ""

  if (docSnap.exists()) {
    const data = docSnap.data()
    caseName = data.title || ""
    jurisdiction = data.jurisdiction || ""
    title = `${caseName} – 20,000+ Case Briefs with Summaries | CadexLaw`
    description = `${caseName} case brief summary from ${jurisdiction}. Read the rule of law, facts, issue, holding, reasoning, and dissent in detailed IRAC format.`
  }

  return {
    title,
    description,
    keywords: `${caseName}, case brief summary, IRAC outline, issue spotting, legal analysis, CadexLaw`,
    alternates: {
      canonical: `https://www.cadexlaw.com/casebriefs/summaries/${caseId}`,
    },
    icons: '/favicon.png',
    openGraph: {
      title,
      description,
      url: `https://www.cadexlaw.com/casebriefs/summaries/${caseId}`,
      type: 'article',
      site_name: 'CadexLaw',
      images: [
        {
          url: 'https://www.cadexlaw.com/images/case-brief-og.jpg',
          width: 1200,
          height: 630,
          alt: `${caseName} Case Brief Summary`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://www.cadexlaw.com/images/case-brief-og.jpg'],
    },
  }
}

export default function CaseBriefPage({ params }) {
  return <CaseSummaries />
}
