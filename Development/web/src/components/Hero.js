'use client';
import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import CarouselComponent from './Carousel';
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
  FaThumbsUp,
  FaUsers,
  FaGraduationCap,
} from 'react-icons/fa';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

import { useInView } from 'react-intersection-observer';

const targetStats = {
  cases: 400,
  newUsers: 1250,
  statsProvided: 45,
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({
    cases: 0,
    newUsers: 0,
    statsProvided: 0,
  });

  const animateStats = (start, end, setter) => {
    let startTime;
    const duration = 7500;

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

    animateStats(0, targetStats.cases, (value) =>
      setStats((prevStats) => ({ ...prevStats, cases: value }))
    );
    animateStats(0, targetStats.newUsers, (value) =>
      setStats((prevStats) => ({ ...prevStats, newUsers: value }))
    );
    animateStats(0, targetStats.statsProvided, (value) =>
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

  const animatedWord = 'Dream';

  const features = [
    {
      icon: <FaGavel className="text-blue-950 text-4xl mb-4" />,
      title: 'Interactive Practice Exams',
      description:
        'Experience real exam conditions with AI-generated practice tests.',
    },
    {
      icon: <FaSearch className="text-blue-950 text-4xl mb-4" />,
      title: 'Personalized Study Materials',
      description:
        'Access study materials tailored to your strengths and weaknesses.',
    },
    {
      icon: <FaTasks className="text-blue-950 text-4xl mb-4" />,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics.',
    },
    {
      icon: <FaFileAlt className="text-blue-950 text-4xl mb-4" />,
      title: 'Instant Feedback',
      description: 'Immediate feedback to identify areas of improvement.',
    },
    {
      icon: <FaRobot className="text-blue-950 text-4xl mb-4" />,
      title: 'AI-Powered Tutoring',
      description: '24/7 AI tutors for quick assistance.',
    },
    {
      icon: <FaChartLine className="text-blue-950 text-4xl mb-4" />,
      title: 'Adaptive Learning',
      description:
        'Material adapts to your learning style.',
    },
    {
      icon: <FaFileContract className="text-blue-950 text-4xl mb-4" />,
      title: 'Exam Strategies',
      description: 'Effective methods for complex questions.',
    },
    {
      icon: <FaBalanceScale className="text-blue-950 text-4xl mb-4" />,
      title: 'Question Bank',
      description: 'Thousands of questions across topics.',
    },
  ];

  const successStories = [
    {
      name: "Jane Doe",
      initialScore: 154,
      newScore: 158,
      difference: 4,
      quote: "Cadex gave me confidence!",
    },
    {
      name: "John Smith",
      initialScore: 148,
      newScore: 155,
      difference: 7,
      quote: "Personalized feedback made the difference.",
    },
    {
      name: "Ayesha Khan",
      initialScore: 160,
      newScore: 165,
      difference: 5,
      quote: "I finally understood the material.",
    },
    {
      name: "Carlos Mendes",
      initialScore: 150,
      newScore: 157,
      difference: 7,
      quote: "Smarter study beats expensive methods.",
    },
    {
      name: "Linda Green",
      initialScore: 152,
      newScore: 160,
      difference: 8,
      quote: "Structure and resources boosted my score!",
    },
    {
      name: "Mark Thompson",
      initialScore: 149,
      newScore: 156,
      difference: 7,
      quote: "7 points in two months!",
    },
    {
      name: "Sophia Ramirez",
      initialScore: 155,
      newScore: 163,
      difference: 8,
      quote: "Instant feedback = huge jump!",
    },
    {
      name: "David Lee",
      initialScore: 151,
      newScore: 158,
      difference: 7,
      quote: "Felt more prepared than ever.",
    },
    {
      name: "Emma Wilson",
      initialScore: 153,
      newScore: 161,
      difference: 8,
      quote: "AI tutoring made learning easy.",
    },
    {
      name: "James Brown",
      initialScore: 147,
      newScore: 154,
      difference: 7,
      quote: "Tailored study materials helped me pass.",
    },
  ];

  const VerticalDivider = () => (
    <div
      className={`mx-auto w-[2px] my-0 bg-gradient-to-b from-transparent via-slate-500 to-blue-950 transition-all duration-700 ${
        loaded ? 'h-12 sm:h-16 md:h-20 opacity-0' : 'h-0 opacity-0'
      }`}
    />
  );

  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [whoRef, whoInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [costRef, costInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [faqRef, faqInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [uniRef, uniInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [storiesRef, storiesInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [processRef, processInView] = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="w-full bg-transparent">
      {/* Disclaimer Popup */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-lg mx-auto">
            <h2 className="text-3xl font-semibold mb-4">Important Disclaimer</h2>
            <p className="mb-4 text-gray-700">
              Please note that Cadex is a supplementary tool and not a substitute for professional legal advice or formal exams. Verify all information and refer to our{' '}
              <Link href="/legal" className="text-blue-600 underline">
                Terms and Conditions
              </Link>.
            </p>
            <div className="text-right">
              <button
                onClick={handleCloseDisclaimer}
                className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
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

      <div className="max-w-7xl mx-auto px-4 py-0">
        {/* Hero Section */}
        <div
          className={`flex flex-col items-center text-center mx-auto transform transition-transform duration-700 ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h2
            className={
              'text-4xl sm:text-6xl font-semibold py-2 mb-0 ' + poppins.className
            }
          >
            <span className="block mb-4 text-blue-950">
              Your{' '}
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
              School Awaits.
            </span>
            <span className="sr-only">Your Dream School Awaits.</span>
          </h2>

          <p className="text-center sm:text-lg md:text-xl text-black max-w-2xl my-6">
            Cadex combines AI-driven prep and real-time feedback to help you excel at a fraction of the cost.
          </p>

          <div className="flex justify-center mt-6 mb-6">
            <Link
              href="/pricing"
              className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
            >
              <div className="flex items-center justify-center h-full">
                Explore Our Plans
                <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
              </div>
            </Link>
          </div>
        </div>

        <VerticalDivider />

        {/* Features Section */}
        <div
          ref={featuresRef}
          className={`flex flex-col items-center py-4 px-4 md:px-8 lg:px-16 bg-transparent transition-all duration-1000 ${
            featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-7xl w-full">
            <h3 className="text-4xl sm:text-5xl font-semibold text-center text-blue-950">
              Features
            </h3>
            <Swiper
              modules={[Autoplay]}
              spaceBetween={20}
              slidesPerView="auto"
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
              }}
              speed={3000}
              loop={true}
              freeMode={true}
              freeModeMomentum={false}
              className="my-8"
            >
              {features.map((feature, index) => (
                <SwiperSlide
                  key={index}
                  style={{ width: '220px', height: '250px' }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-white rounded shadow-md hover:shadow-xl transition-shadow">
                    {feature.icon}
                    <h4 className="text-lg font-semibold text-blue-950 mb-2 text-center">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-center text-gray-700">
                      {feature.description}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <VerticalDivider />

        {/* Success Stories Section - Carousel */}
        <div
          ref={storiesRef}
          className={`flex flex-col items-center px-4 md:px-8 lg:px-16 transition-all duration-1000 ${
            storiesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-5xl w-full">
            <h3 className="text-4xl sm:text-5xl font-semibold my-6 text-center text-blue-950 ">
              Success Stories
            </h3>
            <Swiper
              modules={[Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
              }}
              speed={3000}
              loop={true}
              freeMode={true}
              freeModeMomentum={false}
              className="my-12"
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
            >
              {successStories.map((story, index) => (
                <SwiperSlide key={index} style={{ width: '320px', height: '320px' }}>
                  <div className="bg-white rounded shadow-md p-6 h-full flex flex-col justify-between hover:shadow-xl transition-shadow">
                    <div>
                      <h4 className="text-xl font-semibold text-blue-950 mb-2">{story.name}</h4>
                      <p className="text-base text-gray-700 italic mb-4">&ldquo;{story.quote}&rdquo;</p>
                    </div>
                    <div className="flex items-center justify-start gap-4 text-gray-700 mt-auto">
                      <span className="text-sm">
                        {story.initialScore} → {story.newScore} (
                        <span className="font-bold text-emerald-500">+{story.difference}</span>)
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <VerticalDivider />
      </div>
    </section>
  );
}
