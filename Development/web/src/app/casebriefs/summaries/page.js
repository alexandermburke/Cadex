import CaseSummaries from '@/components/casebriefs/CaseSummaries'
import React from 'react'

export const metadata = {
  title: "CadexLaw ⋅ Case Brief Summary",
  icons: '/favicon.png',
  description: "View case brief summaries from CadexLaw. Preview the case details and subscribe for full access to in-depth legal analysis.",
  keywords: "case brief, legal summary, CadexLaw, legal cases, case law",
  alternates: {
    canonical: '/'
  }
}

export default function ApplicationPage() {
  return <CaseSummaries />
}
