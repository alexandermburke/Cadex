import Dashboard from '@/components/Dashboard'
import React from 'react'

export const metadata = {
  title: 'CadexLaw – 20,000+ Case Briefs for Cold Calls, IRAC & Bar Exam Prep',
  description:
    'CadexLaw is the #1 Choice for Law Students, 20,000+ expertly crafted case briefs, IRAC issue‑spotter outlines, cold call preparation, bar exam outlines, and practice exams for law students.',
  icons: '/favicon.png',
  keywords: [
    'law school case briefs',
    'cold call preparation',
    'IRAC outlines',
    'issue spotting',
    'bar exam prep',
    'bar outlines',
    'case brief library',
    'legal study aids',
    'Quimbee alternative',
    'LexPlug alternative',
  ],
  openGraph: {
    title: 'CadexLaw – Case Briefs & Bar Exam Prep for Law Students',
    description:
      'Access 20,000+ case briefs, IRAC outlines, cold call prep, and bar outlines at CadexLaw—your premier alternative to Quimbee and LexPlug.',
    url: 'https://www.cadexlaw.com',
    siteName: 'CadexLaw',
    images: [
      {
        url: 'https://www.cadexlaw.com/images/favicon.png',
        width: 1200,
        height: 630,
        alt: 'CadexLaw Case Briefs & Exam Prep',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CadexLaw',
    creator: '@CadexLaw',
    title: 'CadexLaw – Case Briefs & Bar Exam Prep for Law Students',
    description:
      'Discover 20,000+ case briefs, IRAC outlines, cold call and bar exam prep at CadexLaw—your ultimate Quimbee & LexPlug alternative.',
    images: ['https://www.cadexlaw.com/images/twitter-card.jpg'],
  },
  alternates: {
    canonical: 'https://www.cadexlaw.com/dashboard',
  },
}

export default function AdminPage() {
  return <Dashboard />
}
