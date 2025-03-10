'use client';
import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaShieldAlt,
  FaCheck,
  FaChartLine,
  FaLightbulb, // Idea
  FaSearch,    // Research
  FaTools,     // Development
  FaRocket,    // Beta Launch
  FaGlobe,     // Public Launch
  FaChartBar,  // Growth
} from 'react-icons/fa';
import { motion } from 'framer-motion';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: 'easeOut',
      when: "beforeChildren",
      staggerChildren: 0.3,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: 'easeOut' 
    },
  },
};

export default function InvestorSplashPage() {
  const [loaded, setLoaded] = useState(false);

  const milestones = [
    {
      icon: <FaLightbulb className="text-white text-3xl mb-4" />,
      title: 'Idea',
      description: 'Conception of Cadex, identifying the need for AI in legal tech.',
    },
    {
      icon: <FaSearch className="text-white text-3xl mb-4" />,
      title: 'Research',
      description: 'Market research and feasibility studies conducted.',
    },
    {
      icon: <FaTools className="text-white text-3xl mb-4" />,
      title: 'Development',
      description: 'Building the initial platform and integrating AI technologies.',
    },
    {
      icon: <FaRocket className="text-white text-3xl mb-4" />,
      title: 'Beta Launch',
      description: 'Released beta version to selected users for feedback.',
    },
    {
      icon: <FaGlobe className="text-white text-3xl mb-4" />,
      title: 'Public Launch',
      description: 'Official launch of Cadex platform to the public.',
    },
    {
      icon: <FaChartBar className="text-white text-3xl mb-4" />, // Updated Icon
      title: 'Growth',
      description: 'User acquisition and scaling the platform.',
    },
  ];

  const investorBenefits = [
    {
      icon: <FaShieldAlt className="text-white text-5xl mb-4" />,
      title: 'Secure Investment',
      description: 'Cadex employs a scalable SaaS model with high retention rates.',
    },
    {
      icon: <FaCheck className="text-white text-5xl mb-4" />,
      title: 'Proven Market Fit',
      description: 'Validated by adoption in top law schools and firms.',
    },
    {
      icon: <FaChartLine className="text-white text-5xl mb-4" />,
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
    <section className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header Section */}
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Image */}
          <Image
            src="/header.avif"
            alt="Cadex Investor Header"
            width={100}
            height={100}
            unoptimized={true}
            className="mx-auto mb-8"
            priority
          />

          <motion.h1
            className={'text-5xl sm:text-7xl font-bold mb-6 text-gray-200 ' + poppins.className}
            variants={childVariants}
          >
            Invest in the Future of Legal Tech
          </motion.h1>
          <motion.p
            className="text-xl text-white max-w-3xl mx-auto"
            variants={childVariants}
          >
            Cadex is revolutionizing the legal landscape with Vertical AI, providing innovative tools for law students,
            professionals, and firms. Be part of this groundbreaking journey to reshape a $900B industry.
          </motion.p>
          <motion.div
            className="mt-8"
            variants={childVariants}
          >
            <Link
              href="/contact"
              className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-gray-950 to-gray-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-gray before:opacity-20 before:duration-700 hover:before:-translate-x-56"
            >
              <div className="flex items-center justify-center h-full">
                Contact Us
                <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Milestones Section */}
        <motion.div
          className="flex flex-col items-center py-16 bg-transparent"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-white mb-12"
            variants={childVariants}
          >
            Milestones
          </motion.h2>
          <motion.div
            className="relative max-w-4xl w-full"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.3,
                },
              },
            }}
          >
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full border-l-2 border-white"></div>
            {/* Milestone Items */}
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className={`mb-8 flex justify-${index % 2 === 0 ? 'start' : 'end'} items-center w-full`}
                variants={childVariants}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'} relative`}>
                  {index % 2 !== 0 && (
                    <div className=""></div>
                  )}
                  <div className="p-6 rounded-lg">
                    <div className="flex flex-col items-center">
                      {milestone.icon}
                      <h3 className="text-xl font-semibold text-white mb-2 text-center">{milestone.title}</h3>
                      <p className="text-white text-center">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Investor Benefits Section */}
        <motion.div
          className="flex flex-col items-center py-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-white mb-12"
            variants={childVariants}
          >
            Why Invest in Cadex?
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.3,
                },
              },
            }}
          >
            {investorBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center p-6 rounded hover:shadow-xl transition-shadow"
                variants={childVariants}
              >
                {benefit.icon}
                <h3 className="text-xl font-semibold text-white mb-2 text-center">{benefit.title}</h3>
                <p className="text-white text-center">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* FAQs Section */}
        <motion.div
          className="py-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-white mb-12 text-center"
            variants={childVariants}
          >
            FAQs
          </motion.h2>
          <motion.div
            className="space-y-6"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                className=" rounded p-6"
                variants={childVariants}
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-white">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h3
            className="text-3xl font-semibold text-white mb-4"
            variants={childVariants}
          >
            Ready to Invest in the Future?
          </motion.h3>
          <motion.div
            className=""
            variants={childVariants}
          >
            <Link
              href="/contact"
              className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-gray-950 to-gray-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-gray before:opacity-20 before:duration-700 hover:before:-translate-x-56"
            >
              <div className="flex items-center justify-center h-full">
                Get Started
                <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
