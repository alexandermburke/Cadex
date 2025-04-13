import { getDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import CaseSummaries from '@/components/casebriefs/CaseSummaries'

export async function generateMetadata({ params }) {
  const caseId = params?.caseId
  if (!caseId) {
    return {
      title: "CadexLaw Case Brief Summary",
      description: "View case brief summaries on CadexLaw.",
      keywords: "case brief, legal summary, CadexLaw, legal cases, case law",
      alternates: { canonical: "https://www.cadexlaw.com/casebriefs/summaries" },
      icons: '/favicon.png',
      openGraph: {
        title: "CadexLaw Case Brief Summary",
        description: "View case brief summaries on CadexLaw.",
        url: "https://www.cadexlaw.com/casebriefs/summaries",
        type: "website",
        site_name: "CadexLaw"
      },
      twitter: {
        card: "summary_large_image",
        title: "CadexLaw Case Brief Summary",
        description: "View case brief summaries on CadexLaw."
      }
    }
  }
  const docRef = doc(db, 'capCases', caseId)
  const docSnap = await getDoc(docRef)
  let title = "CadexLaw Case Brief Summary"
  let description = "View case brief summaries from CadexLaw. Preview the case details and subscribe for full access to in-depth legal analysis."
  if (docSnap.exists()) {
    const caseData = docSnap.data()
    title = `CadexLaw ⋅ ${caseData.title}`
    description = `${caseData.title} case brief summary from ${caseData.jurisdiction || 'Unknown jurisdiction'}. View key legal details such as rule of law, facts, issue, holding, reasoning, and dissent.`
  }
  return {
    title,
    description,
    keywords: `${title}, case brief, legal summary, CadexLaw, legal cases, case law`,
    alternates: {
      canonical: `https://www.cadexlaw.com/casebriefs/summaries/${caseId}`
    },
    icons: '/favicon.png',
    openGraph: {
      title,
      description,
      url: `https://www.cadexlaw.com/casebriefs/summaries/${caseId}`,
      type: 'website',
      site_name: 'CadexLaw'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  }
}

export default function CaseBriefPage({ params }) {
  return <CaseSummaries />
}
