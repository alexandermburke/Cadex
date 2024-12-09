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
  FaClock,
  FaDollarSign,
  FaThumbsUp,
  FaUsers,
  FaGraduationCap,
} from 'react-icons/fa';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

import { useInView } from 'react-intersection-observer';

// Define targetStats outside the component to prevent re-creation on every render
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

  // Animate only the word "Dream" in "Your Dream School Awaits."
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
      description: 'Monitor your improvement over time with detailed analytics.',
    },
    {
      icon: <FaFileAlt className="text-blue-950 text-4xl mb-4" />,
      title: 'Instant Feedback',
      description: 'Receive immediate feedback to understand areas for improvement.',
    },
    {
      icon: <FaRobot className="text-blue-950 text-4xl mb-4" />,
      title: 'AI-Powered Tutoring',
      description: 'Get assistance from AI tutors available 24/7.',
    },
    {
      icon: <FaChartLine className="text-blue-950 text-4xl mb-4" />,
      title: 'Adaptive Learning',
      description:
        'The platform adapts to your learning style for optimal results.',
    },
    {
      icon: <FaFileContract className="text-blue-950 text-4xl mb-4" />,
      title: 'Exam Strategies',
      description: 'Learn effective strategies to tackle complex exam questions.',
    },
    {
      icon: <FaBalanceScale className="text-blue-950 text-4xl mb-4" />,
      title: 'Comprehensive Question Bank',
      description: 'Access thousands of exam questions across various topics.',
    },
  ];

  const faqs = [
    {
      question: 'What is Cadex?',
      answer:
        'Cadex is an AI-powered exam preparation platform designed to help anyone interested in law to learn and excel, regardless of their current level of education.',
    },
    {
      question: 'Who can benefit from Cadex?',
      answer:
        'Cadex is suitable for high school students, undergraduates, aspiring law students, enrolled law students, and legal professionals seeking to enhance their knowledge and pass exams.',
    },
    {
      question: 'How does Cadex help with exam preparation?',
      answer:
        'Cadex offers AI-driven practice exams, personalized study materials, and instant feedback to optimize your study process and improve your exam performance.',
    },
    {
      question: 'How is Cadex different from traditional exam prep tools?',
      answer:
        'Unlike traditional methods, Cadex leverages advanced AI technology to provide personalized, interactive, and cost-effective exam preparation resources all in one platform.',
    },
    {
      question: 'Can I try Cadex before purchasing?',
      answer:
        'Absolutely! We offer a free trial period so you can experience how Cadex can transform your learning journey.',
    },
  ];

  // Expanded Success Stories array for demo purposes
  const successStories = [
    {
      name: "Jane Doe",
      initialScore: 154,
      newScore: 158,
      difference: 4,
      quote: "I tried Cadex after my attempt with the $950 Testmaster's online equivalent brought my score from a 154 to a 158. The improvement gave me the confidence I needed!",
    },
    {
      name: "John Smith",
      initialScore: 148,
      newScore: 155,
      difference: 7,
      quote: "I was stuck at 148 despite expensive courses. With Cadex’s adaptive approach, I soared to a 155 in just a few weeks. Personalized feedback made all the difference.",
    },
    {
      name: "Ayesha Khan",
      initialScore: 160,
      newScore: 165,
      difference: 5,
      quote: "After struggling at 160, Cadex’s strategic exam prep helped me push my score up to 165. I finally felt like I understood the material, not just memorized it.",
    },
    {
      name: "Carlos Mendes",
      initialScore: 150,
      newScore: 157,
      difference: 7,
      quote: "Spending $950 on traditional prep barely helped. Cadex’s AI-driven tools took me from 150 to 157, proving that smarter study beats expensive methods any day.",
    },
    {
      name: "Linda Green",
      initialScore: 152,
      newScore: 160,
      difference: 8,
      quote: "Cadex provided the structure and resources I needed to improve my score from 152 to 160. Highly recommended!",
    },
    {
      name: "Mark Thompson",
      initialScore: 149,
      newScore: 156,
      difference: 7,
      quote: "With Cadex’s personalized study plans, I increased my LSAT score by 7 points in just two months.",
    },
    {
      name: "Sophia Ramirez",
      initialScore: 155,
      newScore: 163,
      difference: 8,
      quote: "Cadex’s instant feedback and adaptive learning tools helped me jump from 155 to 163 effortlessly.",
    },
    {
      name: "David Lee",
      initialScore: 151,
      newScore: 158,
      difference: 7,
      quote: "Switching to Cadex was the best decision. My score improved by 7 points, and I felt more prepared than ever.",
    },
    {
      name: "Emma Wilson",
      initialScore: 153,
      newScore: 161,
      difference: 8,
      quote: "Cadex’s comprehensive question bank and AI tutoring elevated my LSAT score from 153 to 161.",
    },
    {
      name: "James Brown",
      initialScore: 147,
      newScore: 154,
      difference: 7,
      quote: "After struggling with traditional prep, Cadex helped me achieve a 154 by offering tailored study materials and real-time feedback.",
    },
  ];

  const VerticalDivider = () => (
    <div
      className={`mx-auto w-[2px] my-0 bg-gradient-to-b from-transparent via-slate-500 to-blue-950 transition-all duration-700 ${
        loaded ? 'h-12 sm:h-16 md:h-20 opacity-0' : 'h-0 opacity-0'
      }`}
    />
  );

  // Animations using useInView
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [whoRef, whoInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [costRef, costInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [faqRef, faqInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [uniRef, uniInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [storiesRef, storiesInView] = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="w-full bg-white">
      {/* Disclaimer Popup */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-lg mx-auto">
            <h2 className="text-3xl font-semibold mb-4">Important Disclaimer</h2>
            <p className="mb-4 text-gray-700">
              Please be advised that Cadex is intended solely as a supplementary tool to assist lawyers, law students, and legal enthusiasts in their educational and professional pursuits. It is not a substitute for professional legal advice from a qualified attorney, nor should it be considered an alternative to formal legal examinations such as the LSAT or Bar Exam. Users should exercise caution, as artificial intelligence technologies in their current state may occasionally produce exaggerated, inaccurate, or falsified representations of legal cases. Therefore, any information or insights provided by Cadex should not be relied upon without conducting your own independent research and verification. For further details and stipulations, please refer to our{' '}
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
            {/* "Your Dream School Awaits." with only "Dream" animated */}
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
                      data-letter={letter}
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
            Cadex offers a highly advanced AI-based exam prep with direct feedback to help anyone interested in law excel at a much more affordable price than traditional study tools.
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
          className={`flex flex-col items-center py-4 px-4 md:px-8 lg:px-16 bg-white transition-all duration-1000 ${
            featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-7xl w-full">
            <h3 className="text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950">
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
                  style={{ width: '220px', height: '250px' }} // Fixed width and height
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

        {/* Success Stories Section - Now with Carousel */}
        <div
          ref={storiesRef}
          className={`flex flex-col items-center px-4 md:px-8 lg:px-16 transition-all duration-1000 ${
            storiesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-5xl w-full">
            <h3 className="text-4xl lg:text-7xl font-semibold my-6 text-center text-blue-950 ">
              <span className='font-medium goldGradient '>Success</span> Stories
            </h3>
            <p className="text-center sm:text-lg md:text-xl text-black max-w-3xl mx-auto mb-10">
              See how our users improved their scores after using Cadex, often following expensive alternatives that offered limited gains.
            </p>
            
            {/* Carousel for Success Stories */}
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
                <SwiperSlide key={index} style={{ width: '320px', height: '360px' }}>
                  <div className="bg-white rounded shadow-md p-6 h-full flex flex-col justify-between hover:shadow-xl transition-shadow">
                    <div>
                      <h4 className="text-xl font-semibold text-blue-950 mb-2">{story.name}</h4>
                      <p className="text-base text-gray-700 italic mb-4">&ldquo;{story.quote}&rdquo;</p>
                    </div>
                    <div className="flex items-center justify-start gap-4 text-gray-700 mt-auto">
                      <span className="text-sm">
                        Original Score: <span className="font-bold">{story.initialScore}</span>
                      </span>
                      <span className="text-sm">→</span>
                      <span className="text-sm">
                        New Score: <span className="font-bold">{story.newScore}</span> (Improvement: <span className="font-bold text-emerald-500">+{story.difference}</span>)
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <VerticalDivider />

        {/* Who Can Benefit Section */}
        <div
          ref={whoRef}
          className={`flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 bg-white transition-all duration-1000 ${
            whoInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-7xl w-full">
            <h3 className="text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950">
              Who Can <span className='font-medium goldGradient '>Benefit</span> from Cadex
            </h3>
            <p className="text-center sm:text-lg md:text-xl text-black max-w-3xl mx-auto my-6">
              Cadex is designed for anyone passionate about law - whether you are a high school student exploring career options, an undergraduate considering law school, an aspiring law student preparing for entrance exams, an enrolled law student, or a legal professional seeking to enhance your knowledge.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center p-6 bg-white rounded shadow-md hover:shadow-xl transition-shadow">
                <FaGraduationCap className="text-blue-950 text-4xl mb-4" />
                <h4 className="text-xl font-semibold text-blue-950 mb-2 text-center">
                  High School Students
                </h4>
                <p className="text-base text-center text-gray-700">
                  Begin your exploration into the field of law with foundational materials and guidance.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded shadow-md hover:shadow-xl transition-shadow">
                <FaGraduationCap className="text-blue-950 text-4xl mb-4" />
                <h4 className="text-xl font-semibold text-blue-950 mb-2 text-center">
                  Undergraduates
                </h4>
                <p className="text-base text-center text-gray-700">
                  Prepare for law school entrance exams and strengthen your understanding of legal concepts.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded shadow-md hover:shadow-xl transition-shadow">
                <FaGavel className="text-blue-950 text-4xl mb-4" />
                <h4 className="text-xl font-semibold text-blue-950 mb-2 text-center">
                  Law Students & Professionals
                </h4>
                <p className="text-base text-center text-gray-700">
                  Enhance your exam preparation and professional knowledge with advanced AI tools.
                </p>
              </div>
            </div>
          </div>
        </div>

        <VerticalDivider />

        {/* Save Money with Cadex Section */}
        <div
          ref={costRef}
          className={`flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 transition-all duration-1000 ${
            costInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-5xl w-full">
            <h3 className="text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950 mb-8">
              Save <span className='font-medium goldGradient '>Money</span> with Cadex
            </h3>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-8">
              {/* Cadex Card */}
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 w-full max-w-sm">
                <h4 className="text-2xl font-bold text-blue-950 mb-2">Cadex</h4>  
                <p className="text-gray-700 mb-1">as low as</p>
                <p className="text-4xl font-semibold text-emerald-400 mb-1">$15</p>
                <p className="text-gray-600">per month</p>
                <div className="mt-4">
                  <ul className="list-disc list-inside text-gray-700">
                    <li>AI-Powered Practice Exams</li>
                    <li>Personalized Study Materials</li>
                    <li>Affordable Pricing</li>
                    <li>Instant, Customized Feedback</li>
                  </ul>
                </div>
              </div>
              {/* Traditional Exam Prep Card */}
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300 w-full max-w-sm">
                <h4 className="text-2xl font-bold text-blue-950 mb-2">Traditional Exam Prep</h4>
                <p className="text-gray-700 mb-1">starting at</p>
                <p className="text-4xl font-semibold text-red-600 mb-1">$70</p>
                <p className="text-gray-600">per month</p>
                <div className="mt-4">
                  <ul className="list-disc list-inside text-gray-700">
                    <li>Limited Question Explanations</li>
                    <li>Generic Study Materials</li>
                    <li>High Costs</li>
                    <li>Less Personalized Feedback</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Savings Highlight */}
            <div className="mt-12 text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-blue-950">
                Save Up to <span className="text-emerald-400">$1,400</span> Annually!
              </p>
              <p className="text-lg sm:text-xl text-gray-700 mt-4 max-w-2xl mx-auto">
                By choosing Cadex, you gain access to advanced AI-driven tools and personalized learning paths at a fraction of the cost of traditional exam prep services. Invest smartly in your legal education without breaking the bank.
              </p>
            </div>
          </div>
        </div>

        <VerticalDivider />

        {/* Universities Section */}
        <div
          ref={uniRef}
          className={`flex flex-col items-center py-8 px-4 md:px-8 lg:px-16 transition-all duration-1000 ${
            uniInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-5xl w-full">
            <h3 className="text-4xl lg:text-7xl font-semibold my-12 text-center text-blue-950 ">
              Universities We Work With
            </h3>
            <CarouselComponent />
          </div>
        </div>
      </div>
    </section>
  );
}
