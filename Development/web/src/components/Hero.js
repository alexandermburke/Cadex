'use client';
import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image'; // Importing the Image component
import {
  FaChartLine,
  FaRocket,
  FaUserFriends,
  FaDollarSign,
  FaShieldAlt,
  FaCheck,
} from 'react-icons/fa';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

export default function InvestorSplashPage() {
  const [loaded, setLoaded] = useState(false);

  const milestones = [
    {
      icon: <FaChartLine className="text-blue-950 text-5xl mb-4" />,
      title: 'Rapid Growth',
      description: 'Achieved 2x monthly user growth in the last 6 months.',
    },
    {
      icon: <FaUserFriends className="text-blue-950 text-5xl mb-4" />,
      title: 'Expanding Community',
      description: 'Over 10,000 active users across professionals and students.',
    },
    {
      icon: <FaDollarSign className="text-blue-950 text-5xl mb-4" />,
      title: 'Revenue Potential',
      description: 'Projected ARR of $1.5M within the next fiscal year.',
    },
    {
      icon: <FaRocket className="text-blue-950 text-5xl mb-4" />,
      title: 'Innovation-Driven',
      description: 'Leveraging AI to transform legal education and practice.',
    },
  ];

  const investorBenefits = [
    {
      icon: <FaShieldAlt className="text-blue-950 text-5xl mb-4" />,
      title: 'Secure Investment',
      description: 'Cadex employs a scalable SaaS model with high retention rates.',
    },
    {
      icon: <FaCheck className="text-blue-950 text-5xl mb-4" />,
      title: 'Proven Market Fit',
      description: 'Validated by adoption in top law schools and firms.',
    },
    {
      icon: <FaChartLine className="text-blue-950 text-5xl mb-4" />,
      title: 'High ROI',
      description: 'Targeting a 300% return over the next 3 years.',
    },
  ];

  const faqData = [
    {
      question: 'What is Cadex?',
      answer:
        'Cadex is a multi-tool platform powered by AI, designed for legal professionals and students to enhance their practice, education, and efficiency.',
    },
    {
      question: 'Why should I invest in Cadex?',
      answer:
        'Cadex is positioned at the intersection of law and AI, addressing a $900B global legal market with innovative, scalable solutions.',
    },
    {
      question: 'How does Cadex generate revenue?',
      answer:
        'Cadex operates on a subscription-based SaaS model with tiered plans for students, professionals, and enterprises.',
    },
    {
      question: 'Who is the target audience?',
      answer:
        'Cadex serves law students, legal professionals, and law firms seeking efficiency and innovation in legal workflows.',
    },
  ];

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center">
          {/* Header Image */}
          <Image
            src="/header.png" // Path to the header image
            alt="Cadex Investor Header"
            width={125} // Adjust width based on your layout
            height={125} // Adjust height based on your layout
            className="mx-auto mb-8"
            priority
          />

          <h1 className={'text-5xl sm:text-7xl font-bold mb-6 ' + poppins.className}>
            Invest in the Future of Legal Tech
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Cadex is revolutionizing the legal landscape with Vertical AI, providing innovative tools for law students,
            professionals, and firms. Be part of this groundbreaking journey to reshape a $900B industry.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
            >
              <div className="flex items-center justify-center h-full">
                Contact Us
                <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
              </div>
            </Link>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="flex flex-col items-center py-16 bg-gray-100">
          <h2 className="text-4xl sm:text-5xl font-bold text-blue-950 mb-12">Key Milestones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 bg-white rounded shadow-md hover:shadow-xl transition-shadow"
              >
                {milestone.icon}
                <h3 className="text-xl font-semibold text-blue-950 mb-2 text-center">{milestone.title}</h3>
                <p className="text-gray-700 text-center">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Investor Benefits Section */}
        <div className="flex flex-col items-center py-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-blue-950 mb-12">Why Invest in Cadex?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {investorBenefits.map((benefit, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 bg-white rounded shadow-md hover:shadow-xl transition-shadow"
              >
                {benefit.icon}
                <h3 className="text-xl font-semibold text-blue-950 mb-2 text-center">{benefit.title}</h3>
                <p className="text-gray-700 text-center">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Section */}
        <div className="py-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-blue-950 mb-12 text-center">FAQs</h2>
          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white rounded shadow-md p-6">
                <h3 className="text-lg font-semibold text-blue-950 mb-2">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-semibold text-blue-950 mb-4">Ready to Invest in the Future?</h3>
          <Link
            href="/contact"
            className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
          >
            <div className="flex items-center justify-center h-full">
              Get Started
              <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
