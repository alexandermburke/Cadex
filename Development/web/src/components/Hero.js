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
  FaRobot,
  FaChartLine,
  FaFileContract,
  FaBalanceScale,
  FaUserPlus,
  FaCogs,
  FaGraduationCap,
  FaComment,
  FaLightbulb, // Additional icon
  FaBook,        // Additional icon
  FaLaptopCode,  // Additional icon
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
  const { currentUser, userDataObj } = useAuth(); // Ensure useAuth is imported
  const isDarkMode = userDataObj?.darkMode || false;
  const [loaded, setLoaded] = useState(false);

  // Animate stats counters
  const animateStats = (start, end, setter) => {
    let startTime;
    const duration = 5000; // Reduced duration for faster animation

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

  // Disclaimer Popup
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }

    setLoaded(true);

    // Animate stats when component mounts
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

  const animatedWord = 'Experience';

  // Features (focusing on law school)
  const features = [
    {
      icon: <FaGavel className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Interactive Practice Exams',
      description:
        'Experience real exam conditions with AI-generated practice tests.',
    },
    {
      icon: <FaSearch className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Personalized Study Materials',
      description:
        'Access materials tailored to your strengths and weaknesses.',
    },
    {
      icon: <FaTasks className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics.',
    },
    {
      icon: <FaFileAlt className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Instant Feedback',
      description: 'Immediate feedback to identify areas of improvement.',
    },
    {
      icon: <FaRobot className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'AI-Powered Tutoring',
      description: '24/7 AI tutors for quick assistance.',
    },
    {
      icon: <FaChartLine className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Adaptive Learning',
      description:
        'Material adapts to your learning style for maximum efficiency.',
    },
    {
      icon: <FaFileContract className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Exam Strategies',
      description: 'Effective methods for tackling tough law school questions.',
    },
    {
      icon: <FaBalanceScale className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Question Bank',
      description: 'Thousands of practice questions across legal topics.',
    },
    // Additional Features
    {
      icon: <FaLightbulb className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Smart Flashcards',
      description: 'Reinforce your knowledge with intelligent flashcards.',
    },
    {
      icon: <FaBook className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Comprehensive Guides',
      description: 'In-depth guides covering all essential legal subjects.',
    },
    {
      icon: <FaLaptopCode className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Interactive Coding Modules',
      description: 'Engage with coding modules tailored for legal studies.',
    },
    {
      icon: <FaComment className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Community Support',
      description: 'Join a community of peers for collaborative learning.',
    },
  ];

  // Duplicate features array to allow seamless scrolling
  const duplicatedFeatures = [...features, ...features, ...features];

  // How It Works Steps
  const howItWorks = [
    {
      icon: <FaUserPlus className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Sign Up & Personalize',
      description:
        'Create your account and customize your study preferences to get started.',
    },
    {
      icon: <FaCogs className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Access AI Tools',
      description:
        'Utilize our AI-powered tools for practice exams, flashcards, and more.',
    },
    {
      icon: <FaGraduationCap className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Track Your Progress',
      description:
        'Monitor your performance with detailed analytics and tailored feedback.',
    },
    {
      icon: <FaRobot className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Achieve Success',
      description:
        'Leverage CadexLaw’s resources to excel in your law studies and exams.',
    },
    // Additional How It Works steps
    {
      icon: <FaChartLine className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Advanced Analytics',
      description:
        'Gain insights into your study patterns with our advanced analytics tools.',
    },
    {
      icon: <FaLightbulb className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Innovative Learning Methods',
      description:
        'Experience cutting-edge learning techniques designed for law students.',
    },
    {
      icon: <FaBook className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Extensive Resources',
      description:
        'Access a vast library of legal resources to support your studies.',
    },
    {
      icon: <FaComment className={`${isDarkMode ? 'text-white' : 'text-blue-950'} text-4xl mb-4`} />,
      title: 'Expert Support',
      description:
        'Connect with legal experts for guidance and mentorship.',
    },
  ];

  // Duplicate howItWorks array for animation purposes
  const duplicatedHowItWorks = [...howItWorks, ...howItWorks, ...howItWorks];

  const VerticalDivider = () => (
    <div
      className={`mx-auto w-[2px] my-4 ${
        isDarkMode ? 'bg-white' : 'bg-gradient-to-b from-transparent via-slate-500 to-blue-950'
      } transition-all duration-700 ${
        loaded ? 'h-12 sm:h-16 md:h-20 opacity-0' : 'h-0 opacity-0'
      }`}
    />
  );

  // Intersection Observers
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });
  // Removed howItWorksRef since it's now integrated into Features
  // const [howItWorksRef, howItWorksInView] = useInView({ threshold: 0.1, triggerOnce: true });

  const [stats, setStats] = useState({
    cases: 0,
    newUsers: 0,
    statsProvided: 0,
  });

  return (
    <section className="w-full bg-transparent relative">
      {/* SVG Background with Blur */}
      <HeroBackground />

      {/* Disclaimer Popup */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[151] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg mx-auto">
            <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">Disclaimer</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              CadexLaw&apos;s resources are for educational purposes only and don&apos;t constitute legal advice or establish an attorney-client relationship. We&apos;re not experts in education or law. Please research and consult a licensed attorney or educator for legal matters or educational decisions. For more details, see our{' '}
              <Link href="/termsandconditions" className="text-blue-600 underline">
                Terms and Conditions
              </Link>.
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

      <div className=" mx-auto px-4 py-0 relative z-10 mt-8">
        {/* Hero Section */}
        <div
          className={`flex flex-col items-center text-center mx-auto transform transition-transform duration-700 ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h2
            className={`text-7xl sm:text-7xl font-semibold py-2 mb-20 ${
              isDarkMode ? 'text-white' : 'text-blue-950'
            } ` + poppins.className}
          >
            <span className="block mb-4">
              Your Dream School{' '}
              <span className="relative inline-block" key={animationTrigger} aria-hidden="true">
                {animatedWord.split('').map((letter, letterIndex) => {
                  if (letter === ' ') {
                    return <span key={letterIndex}>&nbsp;</span>;
                  }
                  return (
                    <span
                      key={letterIndex}
                      className="flare-letter"
                      style={{
                        '--animation-delay': `${letterIndex * 150}ms`,
                      }}
                    >
                      {letter}
                    </span>
                  );
                })}
              </span>{' '}
              Awaits.
            </span>
            <span className="sr-only">Your Dream School Experience Awaits.</span>
          </h2>

          <p
            className={`text-center text-3xl sm:text-3xl md:text-3xl ${
              isDarkMode ? 'text-white' : 'text-black'
            } max-w-2xl my-9`}
          >
            By law students, for law students.
          </p>

          <div className="flex justify-center mt-6 mb-6">
            <Link
              href="/pricing"
              className={
                'group relative h-12 w-56 overflow-hidden rounded bg-blue-950 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }
            >
              <div className="flex items-center justify-center h-full">
                Explore Our Plans
                <i className="ml-8 fa-solid fa-arrow-right transition-opacity duration-200"></i>
              </div>
            </Link>
          </div>
        </div>

        <VerticalDivider />

        {/* Features Carousel */}
        <div
          ref={featuresRef}
          className={`flex flex-col items-center py-4 px-4 md:px-8 lg:px-16 my-20 bg-transparent transition-all duration-1000 ${
            featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="w-1/2">
            <h3
              className={`text-4xl sm:text-5xl font-semibold text-center ${
                isDarkMode ? 'text-white ' : 'text-blue-950 '
              }`}
            >
              Features
            </h3>
            <Swiper
              modules={[Autoplay, FreeMode]}
              spaceBetween={20}
              slidesPerView="auto"
              autoplay={{
                delay: 0, // No delay between transitions
                disableOnInteraction: false,
                reverseDirection: false, // Scroll forward
              }}
              speed={15000} // Faster speed: 15 seconds for a full loop
              loop={true}
              freeMode={false}
              freeModeVelocityRatio={0.5}
              className="my-8"
            >
              {duplicatedFeatures.map((feature, index) => (
                <SwiperSlide key={index} style={{ width: '220px', height: '250px' }}>
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-transparent rounded shadow-lg hover:shadow-xl transition-shadow">
                    {feature.icon}
                    <h4
                      className={`text-lg font-semibold mb-2 text-center ${
                        isDarkMode ? 'text-white ' : 'text-blue-950 '
                      }`}
                    >
                      {feature.title}
                    </h4>
                    <p
                      className={`text-sm ${
                        isDarkMode ? 'text-white ' : 'text-gray-700 '
                      }`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* How It Works Carousel */}
            <Swiper
              modules={[Autoplay, FreeMode]}
              spaceBetween={20}
              slidesPerView="auto"
              autoplay={{
                delay: 0, 
                disableOnInteraction: false,
                reverseDirection: true, 
              }}
              speed={15000} 
              loop={true}
              freeMode={false}
              freeModeVelocityRatio={0.5}
              className="my-8"
            >
              {duplicatedHowItWorks.map((step, index) => (
                <SwiperSlide key={index} style={{ width: '220px', height: '250px' }}>
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-transparent rounded shadow-lg hover:shadow-xl transition-shadow">
                    {step.icon}
                    <h4
                      className={`text-lg font-semibold mb-2 text-center ${
                        isDarkMode ? 'text-white ' : 'text-blue-950 '
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p
                      className={`text-sm ${
                        isDarkMode ? 'text-white ' : 'text-gray-700 '
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <VerticalDivider />

        {/* Add any additional sections here */}
      </div>
    </section>
  );
}
