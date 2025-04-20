import Splash from '@/components/tools/Splash'
import React from 'react'

export const metadata = {
  title: 'CadexLaw – 20,000+ Case Briefs, IRAC & Bar Exam Prep',
  description:
    'Join CadexLaw today and unlock access to 20,000+ expert case briefs, IRAC issue‑spotter outlines, cold call prep, and bar exam resources—your ultimate Quimbee & LexPlug alternative.',
  icons: '/favicon.png',
  keywords: [
    'law school case briefs',
    'sign up case briefs',
    'IRAC outlines',
    'issue spotting',
    'bar exam prep',
    'cold call preparation',
    'legal study aids',
    'Quimbee alternative',
    'LexPlug alternative',
  ],
  alternates: {
    canonical: 'https://www.cadexlaw.com/application',
  },
  openGraph: {
    title: 'CadexLaw – Sign Up for Case Briefs & Exam Prep',
    description:
      'Create your CadexLaw account to access thousands of case briefs, IRAC outlines, cold call prep, and practice exams tailored for law students.',
    url: 'https://www.cadexlaw.com/application',
    siteName: 'CadexLaw',
    images: [
      {
        url: 'https://www.cadexlaw.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CadexLaw Sign Up – Case Briefs & Exam Prep',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CadexLaw',
    creator: '@CadexLaw',
    title: 'CadexLaw – Sign Up for Case Briefs & Exam Prep',
    description:
      'Register at CadexLaw and get instant access to expert case briefs, IRAC outlines, cold call prep, and bar exam tools—your top Quimbee & LexPlug alternative.',
    images: ['https://www.cadexlaw.com/images/twitter-card.jpg'],
  },
}

export default function ApplicationPage() {
  return <Splash />
}
