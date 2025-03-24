'use client';
import React, { useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const mainContainerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
};

// Mapping object for detailed topic content
const topicsData = {
  'Offer and Acceptance': {
    title: 'Offer and Acceptance',
    overview: 'Offer and Acceptance is the cornerstone of contract formation. This section examines what constitutes a valid offer, the moment of acceptance, and the practical implications of communication between parties.',
    keyElements: [
      'Offer: A clear proposal made by one party to another.',
      'Acceptance: Unconditional agreement to the terms proposed.',
      'Communication: The method and timing of delivering offers and acceptances.'
    ],
    caseStudies: 'Analyze landmark cases such as <em>Carlill v Carbolic Smoke Ball Co.</em> and discuss scenarios where the &quot;mirror image rule&quot; applies. Visual aids like interactive diagrams can help illustrate the sequence.',
    additionalFeatures: [
      'Interactive timelines of case law developments',
      'Video explanations and expert commentary',
      'Downloadable notes and further reading resources'
    ],
    interactiveElements: 'Quizzes or practice hypotheticals that simulate an offer scenario to test your understanding.',
    suggestions: [
      'Review additional case law on offer and acceptance.',
      'Check out interactive diagrams of the negotiation process.',
      'Participate in a discussion forum about modern interpretations.'
    ]
  },
  'Consideration': {
    title: 'Consideration',
    overview: 'Consideration refers to the benefit that each party gains from a contract. This section explores what constitutes valid consideration, the exchange of value, and the concept of detriment in contractual agreements.',
    keyElements: [
      'Value Exchange: Both parties must offer something of value.',
      'Pre-existing Duty: Limits on using an existing obligation as consideration.',
      'Nominal Consideration: Token amounts may not reflect a true exchange.'
    ],
    caseStudies: 'Discuss cases like <em>Hamer v. Sidway</em> and <em>Stilk v. Myrick</em> to understand judicial interpretations of consideration.',
    additionalFeatures: [
      'Flowcharts illustrating various contract scenarios',
      'Downloadable summary charts and key takeaways',
      'Embedded interactive quizzes'
    ],
    interactiveElements: 'Interactive examples where you match the correct type of consideration with hypothetical scenarios.',
    suggestions: [
      'Explore scholarly articles on the evolution of consideration.',
      'Review flowcharts that explain complex scenarios.',
      'Test your knowledge with our interactive quizzes.'
    ]
  },
  'Mutual Assent': {
    title: 'Mutual Assent',
    overview: 'Mutual Assent, or the &quot;meeting of the minds&quot;, is essential for a valid contract. This section discusses how parties establish assent and the challenges in proving it.',
    keyElements: [
      'Communication of Intent: How each party signals willingness to contract.',
      'Objective Theory: Relying on outward expressions rather than subjective intent.',
      'Handling Discrepancies: Resolving mismatches in the offer and acceptance.'
    ],
    caseStudies: 'Explore cases where courts determined whether mutual assent was achieved. Interactive simulations could let you decide if assent exists in a given scenario.',
    additionalFeatures: [
      'Interactive diagrams mapping negotiation processes',
      'Annotations on pivotal cases',
      'Embedded video lectures'
    ],
    interactiveElements: 'Try hypotheticals where you determine if mutual assent has been reached.',
    suggestions: [
      'Watch video lectures on mutual assent.',
      'Review annotated case summaries for deeper insights.',
      'Participate in simulation exercises to test your reasoning.'
    ]
  },
  'Capacity': {
    title: 'Capacity',
    overview: 'Capacity addresses whether a party has the legal ability to enter a contract. This section details issues related to age, mental competence, and the influence of substances.',
    keyElements: [
      'Minors: Rules governing contracts involving minors.',
      'Mental Competence: Criteria for assessing a party&apos;s mental capacity.',
      'Substance Influence: How intoxication affects contractual capacity.'
    ],
    caseStudies: 'Examine cases like <em>Lucy v. Zehmer</em> and others that highlight capacity issues. Use interactive timelines to see how legal standards have evolved.',
    additionalFeatures: [
      'Infographics summarizing capacity requirements',
      'Resource links to key case law and scholarly articles',
      'Downloadable study guides'
    ],
    interactiveElements: 'Interactive case studies to decide if a party had the necessary capacity in a given fact pattern.',
    suggestions: [
      'Review infographics on capacity requirements.',
      'Check out downloadable study guides.',
      'Join discussions on challenging capacity scenarios.'
    ]
  },
  // For demonstration, other topics have placeholder content.
  'Conditions': {
    title: 'Conditions',
    overview: 'Detailed content for Conditions coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Substantial Performance': {
    title: 'Substantial Performance',
    overview: 'Detailed content for Substantial Performance coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Material vs. Minor Breach': {
    title: 'Material vs. Minor Breach',
    overview: 'Detailed content for Material vs. Minor Breach coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Anticipatory Repudiation': {
    title: 'Anticipatory Repudiation',
    overview: 'Detailed content for Anticipatory Repudiation coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Duress': {
    title: 'Duress',
    overview: 'Detailed content for Duress coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Undue Influence': {
    title: 'Undue Influence',
    overview: 'Detailed content for Undue Influence coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Misrepresentation': {
    title: 'Misrepresentation',
    overview: 'Detailed content for Misrepresentation coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Unconscionability': {
    title: 'Unconscionability',
    overview: 'Detailed content for Unconscionability coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Statute of Frauds': {
    title: 'Statute of Frauds',
    overview: 'Detailed content for Statute of Frauds coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Expectation Damages': {
    title: 'Expectation Damages',
    overview: 'Detailed content for Expectation Damages coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Reliance Damages': {
    title: 'Reliance Damages',
    overview: 'Detailed content for Reliance Damages coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Restitution': {
    title: 'Restitution',
    overview: 'Detailed content for Restitution coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Specific Performance': {
    title: 'Specific Performance',
    overview: 'Detailed content for Specific Performance coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  },
  'Liquidated Damages': {
    title: 'Liquidated Damages',
    overview: 'Detailed content for Liquidated Damages coming soon.',
    keyElements: [],
    caseStudies: 'Content coming soon.',
    additionalFeatures: [],
    interactiveElements: 'Content coming soon.',
    suggestions: ['Suggestions coming soon.']
  }
};

// Suggestions modal component
const SuggestionsModal = ({ suggestions, onClose, isDarkMode }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={clsx(
            'bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full',
            'text-gray-800 dark:text-white'
          )}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Suggestions</h3>
            <button onClick={onClose} aria-label="Close Suggestions">
              <FaTimes size={20} />
            </button>
          </div>
          <ul className="list-disc ml-6">
            {suggestions.map((sugg, idx) => (
              <li key={idx} className="text-sm">{sugg}</li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Generic detailed page for any topic
const DetailedTopicPage = ({ topic, onBack, isDarkMode }) => {
  const data = topicsData[topic];
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  if (!data) {
    return (
      <div className="p-6">
        <p className="text-red-500">No detailed content available for this topic.</p>
        <button onClick={onBack} className={clsx(
          'mt-4 px-4 py-2 rounded text-sm font-semibold',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>
          Back
        </button>
      </div>
    );
  }

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
        <button
          onClick={() => setShowSuggestions(true)}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode
              ? 'bg-blue-700 hover:bg-blue-600 text-white'
              : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >
          Suggestions
        </button>
      </div>
      <h2 className="text-2xl font-bold my-4">{data.title}</h2>
      <section className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Overview</h3>
        <p className="text-sm leading-relaxed">{data.overview}</p>
      </section>
      {data.keyElements.length > 0 && (
        <section className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Key Elements</h3>
          <ul className="list-disc ml-6">
            {data.keyElements.map((el, idx) => (
              <li key={idx} className="text-sm">{el}</li>
            ))}
          </ul>
        </section>
      )}
      <section className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Case Studies &amp; Examples</h3>
        <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: data.caseStudies }} />
      </section>
      {data.additionalFeatures.length > 0 && (
        <section className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Additional Features</h3>
          <ul className="list-disc ml-6">
            {data.additionalFeatures.map((feature, idx) => (
              <li key={idx} className="text-sm">{feature}</li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3 className="text-xl font-semibold mb-2">Interactive Elements</h3>
        <p className="text-sm leading-relaxed">{data.interactiveElements}</p>
      </section>
      {showSuggestions && (
        <SuggestionsModal
          suggestions={data.suggestions}
          onClose={() => setShowSuggestions(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </motion.div>
  );
};

export default function ContractsSubjectGuide() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [currentView, setCurrentView] = useState('overview'); // 'overview' or topic name
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

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

  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  // Switch to a detailed view when any topic is clicked.
  const handleTopicClick = (topic) => {
    if (topicsData[topic]) {
      setCurrentView(topic);
    }
  };

  const goBackToOverview = () => {
    setCurrentView('overview');
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
        {currentView !== 'overview' ? (
          <DetailedTopicPage topic={currentView} onBack={goBackToOverview} isDarkMode={isDarkMode} />
        ) : (
          <motion.div
            className={clsx(
              'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
              isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
            )}
            variants={mainContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-2xl font-bold mb-6">Contracts Subject Guide</h1>
            <div className="space-y-4 leading-relaxed">
              <p>
                Welcome to the <strong>Contracts</strong> Subject Guide! Here, you&apos;ll find an overview of the fundamental principles, doctrines, and key cases that govern contract formation, enforcement, remedies, and defenses.
              </p>
              <div className="my-6 flex items-center justify-between">
                <button
                  onClick={goToPrevSlide}
                  className={clsx(
                    'px-4 py-2 rounded text-sm font-semibold transition-colors',
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                  )}
                >
                  Previous
                </button>
                <h2 className="text-xl font-semibold">{slides[currentSlide].title}</h2>
                <button
                  onClick={goToNextSlide}
                  className={clsx(
                    'px-4 py-2 rounded text-sm font-semibold transition-colors',
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                  )}
                >
                  Next
                </button>
              </div>
              <ul className="list-disc ml-6">
                {slides[currentSlide].items.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleTopicClick(item)}
                    className={clsx('cursor-pointer hover:underline', {
                      'text-blue-600': topicsData[item] !== undefined
                    })}
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-8">
                This guide provides a concise starting point for your Contracts studies. For a deeper dive, refer to casebooks, statutory materials (like the UCC), and restatements.
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
