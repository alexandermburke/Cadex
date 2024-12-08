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

// Import the useInView hook
import { useInView } from 'react-intersection-observer';

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

  const targetStats = {
    cases: 400,
    newUsers: 1250,
    statsProvided: 45,
  };

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
    // Check if the disclaimer has been shown before
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

  // Words that will have the flare effect
  const flareWordsFirstLine = ['your'];
  const flareWordsSecondLine = ['Legal', 'Journey'];

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

  const benefits = [
    {
      icon: <FaClock className="text-blue-950 text-5xl mb-4" />,
      title: 'Study Efficiently',
      description:
        'Maximize your study time with targeted materials and AI guidance.',
    },
    {
      icon: <FaDollarSign className="text-blue-950 text-5xl mb-4" />,
      title: 'Reduce Costs',
      description:
        'Save money with affordable AI-powered exam prep compared to traditional methods.',
    },
    {
      icon: <FaThumbsUp className="text-blue-950 text-5xl mb-4" />,
      title: 'Improve Scores',
      description:
        'Boost your exam performance with personalized learning paths.',
    },
    {
      icon: <FaUsers className="text-blue-950 text-5xl mb-4" />,
      title: 'Accessible Anywhere',
      description: 'Study anytime, anywhere with our fully online platform.',
    },
  ];

  const testimonials = [
    {
      name: 'Emily Watson',
      title: 'Law Student at Harvard Law School',
      handle: '@emilywatson',
      quote:
        'Cadex has transformed my exam prep. The AI-generated practice exams are incredibly helpful.',
      image: '/avatar1.png',
    },
    {
      name: 'Robert Brown',
      title: 'Bar Exam Candidate',
      handle: '@robertbrown',
      quote:
        'The personalized feedback from Cadex helped me focus on my weak areas and pass the bar exam.',
      image: '/avatar2.png',
    },
    {
      name: 'Laura emerald',
      title: 'Professor of Law at Stanford University',
      handle: '@lauraemerald',
      quote:
        'An invaluable tool for students preparing for exams. Cadex makes studying more efficient.',
      image: '/avatar3.png',
    },
    {
      name: 'Michael Lee',
      title: 'Recent Law Graduate',
      handle: '@michaellee',
      quote:
        'Cadex’s adaptive learning paths saved me time and improved my understanding of complex topics.',
      image: '/avatar3.png',
    },
    {
      name: 'Sophia Martinez',
      title: 'Undergraduate Student at NYU',
      handle: '@sophiamartinez',
      quote:
        'As an aspiring law student, Cadex gave me a head start in understanding legal concepts.',
      image: '/avatar2.png',
    },
    {
      name: 'Daniel Kim',
      title: 'High School Senior',
      handle: '@danielkim',
      quote:
        'Cadex made exploring law fun and accessible even before starting college.',
      image: '/avatar1.png',
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

  const VerticalDivider = () => (
    <div
      className={`mx-auto w-[2px] my-0 bg-gradient-to-b from-transparent via-slate-500 to-blue-950 transition-all duration-700 ${
        loaded ? 'h-12 sm:h-16 md:h-20 opacity-0' : 'h-0 opacity-0'
      }`}
    />
  );

  // Animations using useInView
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [benefitRef, benefitInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [whoRef, whoInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [costRef, costInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [faqRef, faqInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [uniRef, uniInView] = useInView({ threshold: 0.1, triggerOnce: true });

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
          {/* First line: Improving your */}
          <h2
            className={
              'text-5xl sm:text-7xl font-semibold py-2 mb-0 ' + poppins.className
            }
          >
            Improving{' '}
            {/* Flare effect on "your" */}
            <span className="relative inline-block" key={animationTrigger}>
              {flareWordsFirstLine.map((word, wordIndex) => (
                <span key={wordIndex} style={{ whiteSpace: 'nowrap' }}>
                  {word.split('').map((letter, letterIndex) => (
                    <span
                      key={letterIndex}
                      className="flare-letter"
                      data-letter={letter}
                      style={{
                        '--animation-delay': `${(wordIndex * 5 + letterIndex) * 150}ms`,
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </h2>

          {/* Second line: Legal Journey with AI */}
          <h2
            className={
              'text-5xl sm:text-7xl font-semibold py-2 mb-8 ' + poppins.className
            }
          >
            {/* Flare effect on "Legal Journey" */}
            <span className="relative inline-block" key={animationTrigger}>
              {flareWordsSecondLine.map((word, wordIndex) => (
                <span key={wordIndex} style={{ whiteSpace: 'nowrap' }}>
                  {word.split('').map((letter, letterIndex) => (
                    <span
                      key={letterIndex}
                      className="flare-letter"
                      data-letter={letter}
                      style={{
                        '--animation-delay': `${(wordIndex * 5 + letterIndex) * 150}ms`,
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                  {' '}
                </span>
              ))}
            </span>{' '}
            with AI
          </h2>

          <p className="text-center sm:text-lg md:text-xl text-black max-w-2xl">
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

        {/* Vertical Divider */}
        <VerticalDivider />

        {/* Features Section */}
        <div
          ref={featuresRef}
          className={`flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 bg-white transition-all duration-1000 ${
            featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-7xl w-full">
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950">
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
              className="my-12"
            >
              {features.map((feature, index) => (
                <SwiperSlide
                  key={index}
                  style={{ width: '200px', height: '200px' }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 Professional rounded shadow-md hover:shadow-xl transition-shadow">
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

        {/* Vertical Divider */}
        <VerticalDivider />

        {/* Who Can Benefit Section */}
        <div
          ref={whoRef}
          className={`flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 bg-white transition-all duration-1000 ${
            whoInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-7xl w-full">
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950">
              Who Can Benefit from Cadex
            </h3>
            <p className="text-center sm:text-lg md:text-xl text-black max-w-3xl mx-auto my-6">
              Cadex is designed for anyone passionate about law—whether you are a high school student exploring career options, an undergraduate considering law school, an aspiring law student preparing for entrance exams, an enrolled law student, or a legal professional seeking to enhance your knowledge. Our platform adapts to your level and helps you progress in your legal journey.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center p-6 bg-white rounded shadow-md hover:shadow-xl transition-shadow">
                <FaGraduationCap className="text-blue-950 text-5xl mb-4" />
                <h4 className="text-xl font-semibold text-blue-950 mb-2 text-center">
                  High School Students
                </h4>
                <p className="text-base text-center text-gray-700">
                  Begin your exploration into the field of law with foundational materials and guidance.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded shadow-md hover:shadow-xl transition-shadow">
                <FaGraduationCap className="text-blue-950 text-5xl mb-4" />
                <h4 className="text-xl font-semibold text-blue-950 mb-2 text-center">
                  Undergraduates
                </h4>
                <p className="text-base text-center text-gray-700">
                  Prepare for law school entrance exams and strengthen your understanding of legal concepts.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded shadow-md hover:shadow-xl transition-shadow">
                <FaGavel className="text-blue-950 text-5xl mb-4" />
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

        {/* Vertical Divider */}
        <VerticalDivider />

        {/* Save Money with Cadex Section */}
        <div
          ref={costRef}
          className={`flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 transition-all duration-1000 ${
            costInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-5xl w-full">
            {/* Section Title */}
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950 mb-8">
              Save Money with Cadex
            </h3>
            
            {/* Pricing Comparison Cards */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-8">
              {/* Traditional Exam Prep Card */}
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <h4 className="text-2xl font-bold text-blue-950 mb-2">Traditional Exam Prep</h4>
                <p className="text-gray-700 mb-1">starting at</p>
                <p className="text-4xl font-semibold text-red-600 mb-1">$70+</p>
                <p className="text-gray-600">per month</p>
                <div className="mt-4">
                  <ul className="list-disc list-inside text-gray-700">
                    <li>Limited Practice Exams</li>
                    <li>Generic Study Materials</li>
                    <li>High Costs</li>
                    <li>Less Personalized Feedback</li>
                  </ul>
                </div>
              </div>
              
              {/* Cadex Card */}
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
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
            
            {/* Call-to-Action Button */}
            <div className="mt-8 flex justify-center">
              <Link
                href="/pricing"
                className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
              >
                <div className="flex items-center justify-center h-full">
                  View Pricing
                  <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <VerticalDivider />

        {/* FAQ Section */}
        <div
          ref={faqRef}
          className={`flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 transition-all duration-1000 ${
            faqInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-5xl w-full">
            <h3 className="text-4xl lg:text-7xl font-semibold my-12 text-center text-blue-950 ">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded shadow-md p-6">
                  <h4 className="text-xl font-semibold text-blue-950 mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-base text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
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
