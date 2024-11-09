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
} from 'react-icons/fa';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

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
  const flareWordsSecondLine = ['Legal', 'Practice'];

  const features = [
    {
      icon: <FaGavel className="text-blue-950 text-4xl mb-4" />,
      title: 'Interactive Legal Simulations',
      description:
        'Experience simulations for defendants, plaintiffs, and judges.',
    },
    {
      icon: <FaSearch className="text-blue-950 text-4xl mb-4" />,
      title: 'Legal Research',
      description: 'Access to extensive legal research databases.',
    },
    {
      icon: <FaTasks className="text-blue-950 text-4xl mb-4" />,
      title: 'Case Management',
      description: 'Efficiently track and organize cases.',
    },
    {
      icon: <FaFileAlt className="text-blue-950 text-4xl mb-4" />,
      title: 'Document Drafting',
      description: 'AI-powered suggestions for drafting legal documents.',
    },
    {
      icon: <FaRobot className="text-blue-950 text-4xl mb-4" />,
      title: 'AI Law Tools',
      description: 'Enhance legal strategy and decision-making with AI.',
    },
    {
      icon: <FaChartLine className="text-blue-950 text-4xl mb-4" />,
      title: 'Predictive Analytics',
      description: 'Forecast case outcomes with advanced analytics.',
    },
    {
      icon: <FaFileContract className="text-blue-950 text-4xl mb-4" />,
      title: 'Contract Review',
      description: 'Faster, more accurate assessments using AI.',
    },
    {
      icon: <FaBalanceScale className="text-blue-950 text-4xl mb-4" />,
      title: 'AI Law Simulation',
      description: 'Simulate cases for practical experience.',
    },
  ];

  const benefits = [
    {
      icon: <FaClock className="text-blue-950 text-5xl mb-4" />,
      title: 'Save Time',
      description:
        'Automate routine tasks and focus on what matters most—your clients.',
    },
    {
      icon: <FaDollarSign className="text-blue-950 text-5xl mb-4" />,
      title: 'Reduce Costs',
      description:
        'Cut down on overhead expenses with efficient AI-powered tools.',
    },
    {
      icon: <FaThumbsUp className="text-blue-950 text-5xl mb-4" />,
      title: 'Improve Accuracy',
      description:
        'Minimize errors with intelligent document drafting and analysis.',
    },
    {
      icon: <FaUsers className="text-blue-950 text-5xl mb-4" />,
      title: 'Enhance Client Satisfaction',
      description:
        'Deliver faster results and better outcomes for your clients.',
    },
  ];

  const testimonials = [
    {
      name: 'Emily Watson',
      title: 'Associate at Smith & Associates',
      handle: '@emilywatson',
      quote:
        'Cadex has been a game-changer for our firm. The AI-powered legal simulations have improved our case strategies significantly.',
      image: '/avatar1.png',
    },
    {
      name: 'Robert Brown',
      title: 'Law Student at Harvard Law School',
      handle: '@robertbrown',
      quote:
        'Using Cadex has enhanced my understanding of complex legal concepts through interactive simulations.',
      image: '/avatar2.png',
    },
    {
      name: 'Laura Green',
      title: 'Professor of Law at Stanford University',
      handle: '@lauragreen',
      quote:
        'An invaluable tool for educating the next generation of legal professionals.',
      image: '/avatar3.png',
    },
    {
      name: 'Michael Lee',
      title: 'Legal Analyst at Global Corp',
      handle: '@michaellee',
      quote:
        'The predictive analytics and AI tools in Cadex have saved us time and significantly reduced costs.',
      image: '/avatar3.png',
    },
    {
      name: 'Sophia Martinez',
      title: 'Paralegal at LegalWorks',
      handle: '@sophiamartinez',
      quote:
        'Cadex simplifies complex legal research, making my job so much easier.',
      image: '/avatar2.png',
    },
    {
      name: 'Daniel Kim',
      title: 'Partner at Kim & Partners',
      handle: '@danielkim',
      quote:
        'The AI tools in Cadex have given us a competitive edge in case preparation.',
      image: '/avatar1.png',
    },
  ];

  const costComparisonData = [
    {
      feature: 'Legal Research',
      traditionalCost: '$500/month',
      cadexCost: '$100/month',
    },
    {
      feature: 'Case Management',
      traditionalCost: '$200/month',
      cadexCost: 'Included',
    },
    {
      feature: 'Document Drafting',
      traditionalCost: '$300/month',
      cadexCost: 'Included',
    },
    {
      feature: 'Predictive Analytics',
      traditionalCost: '$400/month',
      cadexCost: 'Included',
    },
  ];

  const totalTraditionalCost = '$1,400/month';
  const totalCadexCost = '$100/month';

  const faqs = [
    {
      question: 'What is Cadex?',
      answer:
        'Cadex is an AI-powered platform that enhances your legal practice with advanced tools and simulations.',
    },
    {
      question: 'How does Cadex help legal professionals?',
      answer:
        'Cadex provides tools like legal research, case management, document drafting, and predictive analytics to improve efficiency and accuracy.',
    },
    {
      question: 'Is Cadex suitable for law students?',
      answer:
        'Yes, Cadex offers interactive legal simulations and resources that are valuable for both professionals and students.',
    },
    {
      question: 'How secure is my data with Cadex?',
      answer:
        'We prioritize data security and employ industry-standard encryption and security protocols to protect your information.',
    },
    {
      question: 'Can I try Cadex before purchasing?',
      answer:
        'Yes, we offer a free trial period for you to experience the features of Cadex.',
    },
  ];

  const VerticalDivider = () => (
    <div
      className={`mx-auto w-[2px] my-0 bg-gradient-to-b from-transparent via-slate-500 to-blue-950 transition-all duration-700 ${
        loaded ? 'h-12 sm:h-16 md:h-20 opacity-0' : 'h-0 opacity-0'
      }`}
    />
  );

  return (
    <section className="w-full bg-white">
      {/* Disclaimer Popup */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Important Disclaimer</h2>
            <p className="mb-4 text-gray-700">
              Please be advised that Cadex is intended solely as a supplementary tool to assist lawyers, law students, and legal enthusiasts in their educational and professional pursuits. It is not a substitute for professional legal advice from a qualified attorney, nor should it be considered an alternative to formal legal examinations such as the LSAT or Bar Exam. Users should exercise caution, as artificial intelligence technologies in their current state may occasionally produce exaggerated, inaccurate, or falsified representations of legal cases. Therefore, any information or insights provided by Cadex should not be relied upon without conducting your own independent research and verification. For further details and stipulations, please refer to our{' '}
              <Link href="/terms-and-conditions" className="text-blue-600 underline">
                Terms and Conditions
              </Link>.
            </p>
            <div className="text-right">
            <button
           onClick={handleCloseDisclaimer}
           className="before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
              >
            <div className="flex items-center justify-center h-full">
              I Understand
            <i className="ml-8 fa-solid fa-arrow-right"></i>
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

          {/* Second line: Legal Practice with AI */}
          <h2
            className={
              'text-5xl sm:text-7xl font-semibold py-2 mb-8 ' + poppins.className
            }
          >
            {/* Flare effect on "Legal Practice" */}
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
            Cadex helps simulate real-life legal scenarios to enhance your
            practice, based on our database of every known State or Federal
            case.
          </p>

          <div className="flex justify-center mt-6 mb-6">
            <Link
              href="/pricing"
              className="before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
            >
              <div className="flex items-center justify-center h-full">
                Explore Our Plans
                <i className="ml-8 fa-solid fa-arrow-right"></i>
              </div>
            </Link>
          </div>
        </div>

        {/* Vertical Divider */}
        <VerticalDivider />

        {/* Features Section */}
        <div className="flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 bg-white">
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

        {/* Benefits Section */}
        <div className="flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 Professional">
          <div className="max-w-5xl">
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950">
              Why <span className="font-medium goldGradient">Choose</span> Cadex
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 my-12">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-6 bg-white rounded shadow-md hover:shadow-xl transition-shadow"
                >
                  {benefit.icon}
                  <h4 className="text-xl font-semibold text-blue-950 mb-2 text-center">
                    {benefit.title}
                  </h4>
                  <p className="text-base text-center text-gray-700">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <VerticalDivider />

        {/* What Our Users Are Saying Section */}
        <div className="flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 bg-white">
          <div className="max-w-7xl w-full">
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center text-black">
              What <span className="font-medium goldGradient">Our Users</span> Are Saying
            </h3>
            <p className="text-center sm:text-lg md:text-xl text-black max-w-2xl mx-auto my-4">
              People love us because Cadex saves them time and money.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center bg-slate-100 p-6 rounded-lg shadow-md"
                >
                  {testimonial.image && (
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={96}
                      height={96}
                      className="rounded-full mb-4"
                    />
                  )}
                  <h4 className="text-xl font-semibold text-blue-950">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-black mb-2">
                    {testimonial.title}
                  </p>
                  {testimonial.handle && (
                    <p className="text-sm text-black mb-2">
                      {testimonial.handle}
                    </p>
                  )}
                  <p className="text-base text-black ">
                    {testimonial.quote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <VerticalDivider />

        {/* Cost Comparison Section */}
        <div className="flex flex-col items-center py-10 px-4 md:px-8 lg:px-16 Professional">
          <div className="max-w-5xl">
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center text-blue-950">
              <span className="font-medium goldGradient">Save Money</span> with Cadex
            </h3>
            <div className="my-12 overflow-x-auto">
              {/* Cost Comparison Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 bg-blue-950 text-white">Features</th>
                    <th className="px-4 py-2 bg-blue-950 text-white">
                      Traditional Methods
                    </th>
                    <th className="px-4 py-2 bg-blue-950 text-white">Cadex</th>
                  </tr>
                </thead>
                <tbody>
                  {costComparisonData.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'Professional' : ''}
                    >
                      <td className="border px-4 py-2">{item.feature}</td>
                      <td className="border px-4 py-2">{item.traditionalCost}</td>
                      <td className="border px-4 py-2">{item.cadexCost}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="border px-4 py-2">Total Cost</td>
                    <td className="border px-4 py-2">{totalTraditionalCost}</td>
                    <td className="border px-4 py-2">{totalCadexCost}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-center mt-4 text-gray-700">
                Save over an estimated{' '}
                <span className="font-bold">$1,300</span> per month by using Cadex!
              </p>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <VerticalDivider />

        {/* Universities Section */}
        <div className="flex flex-col items-center py-8 px-4 md:px-8 lg:px-16">
          <div className="max-w-5xl w-full">
            <h3 className="text-4xl lg:text-7xl font-semibold my-12 text-center text-blue-950 ">
              Universities We Work With
            </h3>
            <CarouselComponent />
          </div>
        </div>

        {/* Vertical Divider */}
        <VerticalDivider />

        {/* FAQ Section */}
        <div className="flex flex-col items-center py-10 px-4 md:px-8 lg:px-16">
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
      </div>
    </section>
  );
}
