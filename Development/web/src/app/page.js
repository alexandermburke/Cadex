export const metadata = {
  title: 'CadexLaw – Law School Case Briefs, Outlines & Exam Prep',
  description:
    'CadexLaw offers law students instant access to 20,000+ case briefs, course outlines, practice exams, IRAC examples, flashcards, and bar exam prep. Perfect for 1L, 2L, 3L, and bar candidates.',
  keywords: [
    'law school case briefs',
    '1L case briefs free',
    'law school outlines PDF',
    'bar exam practice test',
    'IRAC examples',
    'legal study tools',
    'law school flashcards',
    'torts case summaries',
    'contracts outlines free',
    'constitutional law study aids',
    'civil procedure briefs',
    'criminal law practice questions',
    'law school exam prep',
    'legal writing templates',
    'law school apps',
    'MEE practice questions',
    'MPT sample answers',
    'bar exam essay topics',
    'law school study schedule',
    'legal research guides',
    'evidence law outlines',
    'property law flowcharts',
    'professional responsibility guides',
    'policy analysis briefs',
    'legal ethics outlines',
    'law school GPA booster',
    'pass law school first time',
    'bar exam success tips',
    'free law school case briefs',
    'affordable law school outlines',
    'online law school study aids'
  ],
  icons: {
    icon: '/favicon.ico'
  },
  openGraph: {
    title: 'CadexLaw – Comprehensive Law School Case Briefs, Outlines & Exam Prep',
    description:
      'CadexLaw offers law students instant access to 20,000+ case briefs, course outlines, practice exams, IRAC examples, flashcards, and bar exam prep. Perfect for 1L, 2L, 3L, and bar candidates.',
    url: 'https://www.cadexlaw.com',
    siteName: 'CadexLaw',
    images: [
      {
        url: 'https://www.cadexlaw.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CadexLaw homepage preview'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CadexLaw – Comprehensive Law School Case Briefs, Outlines & Exam Prep',
    description:
      'Law students: access 20,000+ case briefs, outlines, practice exams, IRAC templates, flashcards, and bar prep on CadexLaw.',
    images: ['https://www.cadexlaw.com/images/twitter-card.jpg'],
    site: '@CadexLaw',
    creator: '@CadexLaw'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

import HeroLayout from '@/components/HeroLayout';
import Hero from '@/components/Hero';
import Main from '@/components/Main';
import Product from '@/components/Product';
import Benefits from '@/components/Home';

export default function Page() {
  return (
    <HeroLayout>
      <Main>
        <Hero />
      </Main>
    </HeroLayout>
  );
}
