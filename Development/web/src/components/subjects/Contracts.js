'use client';
import React, { useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

////////////////////////////////////////////////////////////////////////////////
// ANIMATION VARIANTS
////////////////////////////////////////////////////////////////////////////////
const mainContainerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: 'easeInOut' }
  },
};

////////////////////////////////////////////////////////////////////////////////
// SEPARATE DETAILED PAGE COMPONENTS
////////////////////////////////////////////////////////////////////////////////
const DetailedOfferAndAcceptance = ({ onBack, isDarkMode }) => {
  return (
    <motion.div
      className={clsx(
        'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
      )}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        <a
          href="https://cadexlaw.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode
              ? 'bg-blue-700 hover:bg-blue-600 text-white'
              : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Offer and Acceptance</h2>
      <section className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Overview</h3>
        <p className="text-sm leading-relaxed">
          Offer and Acceptance is the cornerstone of contract formation. This section examines what
          constitutes a valid offer, the moment of acceptance, and the practical implications of
          communication between parties.
        </p>
      </section>
      <section className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Key Elements</h3>
        <ul className="list-disc ml-6 text-sm leading-relaxed">
          <li>Offer: A clear proposal made by one party to another.</li>
          <li>Acceptance: Unconditional agreement to the terms proposed.</li>
          <li>Communication: The method and timing of delivering offers and acceptances.</li>
        </ul>
      </section>
      <section className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Case Studies &amp; Examples</h3>
        <p className="text-sm leading-relaxed">
          Analyze landmark cases such as <em>Carlill v Carbolic Smoke Ball Co.</em> and discuss
          scenarios where the &quot;mirror image rule&quot; applies. Visual aids like interactive
          diagrams can help illustrate the sequence.
        </p>
      </section>
      <section className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Additional Features</h3>
        <ul className="list-disc ml-6 text-sm leading-relaxed">
          <li>Interactive timelines of case law developments</li>
          <li>Video explanations and expert commentary</li>
          <li>Downloadable notes and further reading resources</li>
        </ul>
      </section>
      <section>
        <h3 className="text-xl font-semibold mb-2">Interactive Elements</h3>
        <p className="text-sm leading-relaxed">
          Quizzes or practice hypotheticals that simulate an offer scenario to test your
          understanding.
        </p>
      </section>
    </motion.div>
  );
};

const DetailedConsideration = ({ onBack, isDarkMode }) => {
  return (
    <motion.div
      className={clsx(
        'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
      )}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        <a
          href="https://cadexlaw.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode
              ? 'bg-blue-700 hover:bg-blue-600 text-white'
              : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Consideration</h2>
      <section className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Overview</h3>
        <p className="text-sm leading-relaxed">
          Consideration refers to the benefit that each party gains from a contract. This section
          explores what constitutes valid consideration, the exchange of value, and the concept of
          detriment in contractual agreements.
        </p>
      </section>
      {/* ...rest of Consideration content... */}
    </motion.div>
  );
};

////////////////////////////////////////////////////////////////////////////////
// MAIN COMPONENT
////////////////////////////////////////////////////////////////////////////////
export default function ContractsSubjectGuide() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  // Controls sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // Current "view": 'overview' or the topic name
  const [currentView, setCurrentView] = useState('overview');

  // Slide-based timeline
  const [currentSlide, setCurrentSlide] = useState(0);

  // The fill is now based only on currentSlide, so it shrinks when going back.
  const slides = [
    {
      title: '1. Formation',
      items: [
        'Offer and Acceptance',
        'Consideration',
        'Mutual Assent',
        'Capacity'
      ]
    },
    {
      title: '2. Performance &amp; Breach',
      items: [
        'Conditions',
        'Substantial Performance',
        'Material vs. Minor Breach',
        'Anticipatory Repudiation'
      ]
    },
    {
      title: '3. Defenses',
      items: [
        'Duress',
        'Undue Influence',
        'Misrepresentation',
        'Unconscionability',
        'Statute of Frauds'
      ]
    },
    {
      title: '4. Remedies',
      items: [
        'Expectation Damages',
        'Reliance Damages',
        'Restitution',
        'Specific Performance',
        'Liquidated Damages'
      ]
    }
  ];

  ////////////////////////////////////////////////////////////////////////////
  // Slide Navigation
  ////////////////////////////////////////////////////////////////////////////
  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // Thin, White Progress Bar (reverts on back) + Slide Title
  ////////////////////////////////////////////////////////////////////////////
  const TimelineProgressBar = () => {
    const fillPercent = (currentSlide / (slides.length - 1)) * 100;

    return (
      <div className="flex items-center mb-4">
        {/* Back arrow */}
        <button
          onClick={handlePrevSlide}
          className={clsx(
            'mr-4 p-2 rounded-full text-white hover:bg-white/20 transition-colors',
            { 'opacity-50 pointer-events-none': currentSlide === 0 }
          )}
        >
          <FaArrowLeft />
        </button>

        {/* Heading Above the Progress Bar */}
        <div className="text-lg font-semibold mx-4 whitespace-nowrap">
          Contracts Subject Guide
        </div>

        {/* Show current slide title next to the heading */}
        <div className="ml-2 text-sm font-normal italic">
          {slides[currentSlide].title}
        </div>

        {/* Progress bar container (thin, white) */}
        <div className="relative flex-1 h-1 bg-transparent rounded-full overflow-hidden mx-4">
          <motion.div
            className="absolute left-0 top-0 h-1 bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
          {/* Slide markers */}
          {slides.map((slide, index) => {
            const leftPercent = (index / (slides.length - 1)) * 100;
            // The user can jump to any slide up to the current one
            const canJump = index <= currentSlide;
            return (
              <div
                key={slide.title}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${leftPercent}%`, top: '50%' }}
              >
                <div
                  onClick={() => {
                    // Only allow jumping back or to the same slide
                    if (canJump) {
                      setCurrentSlide(index);
                    }
                  }}
                  className={clsx(
                    'w-3 h-3 rounded-full border-2 border-white cursor-pointer',
                    index <= currentSlide ? 'bg-white' : 'bg-gray-400'
                  )}
                  title={slide.title}
                />
              </div>
            );
          })}
        </div>

        {/* Forward arrow */}
        <button
          onClick={handleNextSlide}
          className={clsx(
            'ml-4 p-2 rounded-full text-white hover:bg-white/20 transition-colors',
            { 'opacity-50 pointer-events-none': currentSlide === slides.length - 1 }
          )}
        >
          <FaArrowRight />
        </button>
      </div>
    );
  };

  ////////////////////////////////////////////////////////////////////////////
  // Overview Slide Content
  ////////////////////////////////////////////////////////////////////////////
  const OverviewContent = () => (
    <motion.div
      className={clsx(
        'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
      )}
      variants={mainContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <TimelineProgressBar />
      <div className="space-y-4 leading-relaxed">
        <p>
          Welcome to the <strong>Contracts</strong> Subject Guide! Here, you&apos;ll find an overview of the
          fundamental principles, doctrines, and key cases that govern contract formation, enforcement,
          remedies, and defenses.
        </p>
        <ul className="list-disc ml-6">
          {slides[currentSlide].items.map((item, idx) => (
            <li
              key={idx}
              onClick={() => setCurrentView(item)}
              className={clsx('cursor-pointer hover:underline', 'text-blue-400')}
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8">
          This guide provides a concise starting point for your Contracts studies. For a deeper dive,
          refer to casebooks, statutory materials (like the UCC), and restatements.
        </p>
      </div>
    </motion.div>
  );

  ////////////////////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////////////////////
  const renderContent = () => {
    if (currentView === 'overview') {
      return <OverviewContent />;
    }
    if (currentView === 'Offer and Acceptance') {
      return (
        <DetailedOfferAndAcceptance
          onBack={() => setCurrentView('overview')}
          isDarkMode={isDarkMode}
        />
      );
    }
    if (currentView === 'Consideration') {
      return (
        <DetailedConsideration
          onBack={() => setCurrentView('overview')}
          isDarkMode={isDarkMode}
        />
      );
    }
    // ... similarly handle other topics here ...

    // If no match, default back to Overview
    return <OverviewContent />;
  };

  return (
    <div
      className={clsx(
        'relative flex h-screen transition-colors duration-500',
        isDarkMode ? 'text-white' : 'text-gray-800'
      )}
    >
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/subjects/contracts"
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
              isDarkMode={isDarkMode}
            />
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
          </>
        )}
      </AnimatePresence>
      <main className="flex-1 flex flex-col px-6 relative z-200 h-screen">
        {renderContent()}
      </main>
    </div>
  );
}
