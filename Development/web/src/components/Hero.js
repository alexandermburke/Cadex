'use client';
import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaGavel,
  FaSearch,
  FaTasks,
  FaFileAlt,
  FaInfinity,
  FaChartLine,
  FaFileContract,
  FaBalanceScale,
  FaUserPlus,
  FaCogs,
  FaGraduationCap,
  FaComment,
  FaLightbulb,
  FaBook,
  FaLaptopCode,
  FaArrowRight
} from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay, FreeMode } from 'swiper/modules';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import HeroBackground from './HeroBackground';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

export default function Hero() {
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({
    cases: 0,
    newUsers: 0,
    statsProvided: 0,
  });
  const animateStats = (start, end, setter) => {
    let startTime;
    const duration = 5000;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setter(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const animationInterval = 12;
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
    setLoaded(true);
    animateStats(0, 400, (value) =>
      setStats((prevStats) => ({ ...prevStats, cases: value }))
    );
    animateStats(0, 1250, (value) =>
      setStats((prevStats) => ({ ...prevStats, newUsers: value }))
    );
    animateStats(0, 45, (value) =>
      setStats((prevStats) => ({ ...prevStats, statsProvided: value }))
    );
    const interval = setInterval(() => {
      setAnimationTrigger((prev) => prev + 1);
    }, animationInterval * 1000);
    return () => clearInterval(interval);
  }, []);
  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem('hasSeenDisclaimer', 'true');
  };
  const animatedWord = 'Future';
  const features = [
    {
      icon: (
        <FaGavel className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />
      ),
      title: '20,000+ Case Briefs',
      description:
        'Explore our detailed database of case briefs, add any existing case brief in a few seconds.',
    },
    {
      icon: (
        <FaBook className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />
      ),
      title: 'Study Tools',
      description:
        'Use our legal dictionary, lecture summaries, flashcards, outlines, and IRAC drafting guides to strengthen your understanding.',
    },
    {
      icon: (
        <FaInfinity className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />
      ),
      title: 'Infinitely Variable Exam Prep',
      description:
        'Access practice exams, time management resources, MBE exercises, and the LExAPI Tutor. Tailor your preparation with a variety of settings.',
    },
    {
      icon: (
        <FaFileContract className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />
      ),
      title: 'Subject Guides',
      description:
        'Learn through comprehensive guides on Contracts, Torts, Criminal Law, Property, and Constitutional Law.',
    },
    {
      icon: (
        <FaGraduationCap className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />
      ),
      title: 'Video Lessons',
      description:
        'Watch engaging lessons and boost your knowledge. A full video directory will be available soon.',
    },
    {
      icon: (
        <FaUserPlus className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />
      ),
      title: 'Career & Internship Resources',
      description:
        'Review your resume, prepare for interviews, and find networking opportunities to advance your professional goals.',
    },
  ];
  const cardVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };
  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  const descriptionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };
  const VerticalDivider = () => (
    <div
      className={`mx-auto w-[2px] my-2 ${
        isDarkMode
          ? 'bg-white'
          : 'bg-gradient-to-b from-transparent via-slate-500 to-blue-950'
      } transition-all duration-700 ${
        loaded ? 'h-12 sm:h-16 md:h-20 opacity-0' : 'h-0 opacity-0'
      }`}
    />
  );
  const [featuresRef, featuresInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  return (
    <section className="w-full bg-transparent relative">
      <div className="absolute inset-0 top-[100px] left-0 w-full h-[800px] z-0 pointer-events-none">
        <HeroBackground />
      </div>
      {showDisclaimer && (
        <div className="fixed inset-0 z-[151] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg mx-auto">
            <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
              Disclaimer
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              CadexLaw&apos;s resources are for educational purposes only and
              don&apos;t constitute legal advice or establish an attorney-client
              relationship. We&apos;re not experts in education or law. Please
              research and consult a licensed attorney or educator for legal
              matters or educational decisions. For more details, see our{' '}
              <Link href="/termsandconditions" className="text-blue-600 underline">
                Terms and Conditions
              </Link>
              .
            </p>
            <div className="text-right">
              <button
                onClick={handleCloseDisclaimer}
                className="group relative h-12 w-56 overflow-hidden rounded bg-blue-950 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-center h-full">
                  I Understand
                  <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto px-4 py-0 relative z-10 mt-8">
        <div
          className={`flex flex-col items-center text-center mx-auto transform transition-transform duration-700 ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h2
            className={`text-7xl sm:text-7xl font-semibold py-2 mb-14 ${
              isDarkMode ? 'text-white' : 'text-blue-950'
            } ${poppins.className}`}
          >
            <span className="block mb-5">
              Welcome to the{' '}
              <span
                className="relative inline-block"
                key={animationTrigger}
                aria-hidden="true"
              >
                {animatedWord.split('').map((letter, letterIndex) => {
                  if (letter === ' ')
                    return <span key={letterIndex}>&nbsp;</span>;
                  return (
                    <span
                      key={letterIndex}
                      className="flare-letter"
                      style={{ '--animation-delay': `${letterIndex * 150}ms` }}
                    >
                      {letter}
                    </span>
                  );
                })}
              </span>{' '}
              of Legal Education
            </span>
            <span className="sr-only">
              Welcome to the future of Legal Education
            </span>
          </h2>
          <p className={`text-center text-2xl sm:text-2xl md:text-2xl ${isDarkMode ? 'text-white' : 'text-slate-700'} max-w-2xl mt-4 mb-14`}>
            Affordable legal study tools made by law students, for law students. Join CadexLaw to study smarter & succeed in law.
          </p>
          <div className="flex justify-center mt-6 mb-6 w-full">
            <Link
              href="/casebriefs/allbriefs"
              className="
                block group relative h-12 w-full sm:w-56 overflow-hidden rounded 
                bg-gradient-to-r from-blue-600 to-blue-800 text-white 
                text-sm sm:text-base shadow transition-all duration-300 
                flex items-center justify-center gradientShadowHoverBlue
              "
            >
              <div className="font-semibold flex items-center">
                View Case Briefs <FaArrowRight className="ml-4" />
              </div>
            </Link>
          </div>
        </div>
        <div
          ref={featuresRef}
          className={`flex flex-col items-center px-4 md:px-8 lg:px-16 mt-10 transition-all duration-1000 ${
            featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="relative w-full max-w-3xl mx-auto mt-4">
            <div className="relative w-full h-0 pb-[50%] overflow-hidden rounded-lg shadow-xl">
              <video
                src="/DemoHome.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
              ></video>
            </div>
          </div>
          <h3
            className={`text-4xl sm:text-5xl font-bold text-center ${
              isDarkMode ? 'text-white' : 'text-blue-950'
            } mt-32 mb-12`}
          >
            What We Offer
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={`feature-${index}`}
                className={`p-6 rounded-lg shadow-lg w-full max-w-sm ${
                  isDarkMode ? 'bg-gray-800 bg-opacity-30' : 'bg-white'
                } border border-transparent hover:border-blue-500 transition-colors duration-300`}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div className="flex justify-center" variants={iconVariants} whileHover={{ scale: 1.1, rotate: 5 }}>
                  {feature.icon}
                </motion.div>
                <motion.h4
                  className={`mt-4 text-xl font-semibold text-center ${
                    isDarkMode ? 'text-white' : 'text-blue-950'
                  }`}
                  variants={titleVariants}
                >
                  {feature.title}
                </motion.h4>
                <motion.p
                  className={`mt-2 text-center text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                  variants={descriptionVariants}
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
        <VerticalDivider />
      </div>
    </section>
  );
}

const VerticalDivider = () => (
  <div className="mx-auto w-[2px] my-4 bg-gray-400" />
);
