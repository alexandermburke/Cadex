'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

function CaseCards({ collectionName, isDarkMode }) {
  const router = useRouter();
  const [cases, setCases] = useState([]);

  useEffect(() => {
    async function fetchCases() {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, collectionName));
      const casesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCases(casesData);
    }
    fetchCases();
  }, [collectionName]);

  if (!cases.length) return <p>Loading cases...</p>;

  const randomCases = cases.length > 3 ? [...cases].sort(() => Math.random() - 0.5).slice(0, 3) : cases;

  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {randomCases.map(caseItem => (
        <motion.div
          key={caseItem.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          className={clsx(
            'p-4 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow',
            isDarkMode
              ? 'bg-slate-800 bg-opacity-50 border border-slate-700 text-white'
              : 'bg-white border border-gray-300 text-gray-800'
          )}
          onClick={() => router.push(`/casebriefs/summaries?caseId=${caseItem.id}`)}
        >
          <h3 className="text-lg font-semibold mb-2 truncate">{caseItem.title}</h3>
          <p className="text-sm">{caseItem.jurisdiction || 'Unknown'}</p>
          <p className="text-xs mt-1 text-gray-400">
            Volume: {caseItem.volume || 'N/A'} | Date: {caseItem.decisionDate || 'N/A'}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function DetailedFelonies({ onBack, isDarkMode }) {
  return (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        <a
          href="https://cadexlaw.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Felonies</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          Felonies are serious crimes that carry heavy penalties, including long-term imprisonment, substantial fines, and other severe consequences. They typically involve significant harm or threat to public safety.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Interactive Flowchart: Map out the elements and classifications of felony crimes.</li>
          <li>Multiple-Choice Quiz: Test your knowledge on felony definitions and examples.</li>
          <li>Practice Scenarios: Engage with hypothetical felony cases to solidify your understanding.</li>
        </ul>
      </section>
    </motion.div>
  );
}

function DetailedMisdemeanors({ onBack, isDarkMode }) {
  return (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        <a
          href="https://cadexlaw.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Misdemeanors</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          Misdemeanors are less serious crimes compared to felonies, typically resulting in shorter jail terms, lower fines, or community service. They often involve minor offenses or first-time incidents.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Flowchart: Differentiate between misdemeanor and felony charges.</li>
          <li>Quiz: Assess your understanding of misdemeanor case outcomes.</li>
          <li>Scenarios: Review hypothetical misdemeanor cases.</li>
        </ul>
      </section>
    </motion.div>
  );
}

function DetailedDefenses({ onBack, isDarkMode }) {
  return (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        <a
          href="https://cadexlaw.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Defenses</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          In criminal law, defendants may assert various defenses to reduce or negate liability. Common defenses include insanity, self-defense, duress, entrapment, and mistake of fact.
        </p>
        <p>
          <strong>Insanity:</strong> Claiming the defendant was not in control of their actions due to a mental disorder.
        </p>
        <p>
          <strong>Self-Defense:</strong> Using reasonable force to protect oneself.
        </p>
        <p>
          <strong>Duress:</strong> Arguing that the defendant acted under threat or coercion.
        </p>
        <p>
          <strong>Entrapment:</strong> Asserting that law enforcement induced the defendant to commit a crime.
        </p>
        <p>
          <strong>Mistake of Fact:</strong> A genuine misunderstanding that negates criminal intent.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Checklist: Evaluate the applicability of criminal defenses.</li>
          <li>Case Analyzer: Review scenarios to determine valid defenses.</li>
          <li>Quick Reference Charts: Summaries of defenses with case examples.</li>
        </ul>
      </section>
    </motion.div>
  );
}

function DetailedSentencing({ onBack, isDarkMode }) {
  return (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        <a
          href="https://cadexlaw.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Sentencing</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          Sentencing in criminal law involves determining the appropriate punishment for a convicted offender. Options may include incarceration, probation, fines, community service, and restitution. The sentence often reflects the severity of the crime and the defendant&apos;s criminal history.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Sentencing Calculator: Compare potential sentences.</li>
          <li>Scenario Builder: Explore sentencing outcomes based on case facts.</li>
          <li>Reference Charts: Overview of sentencing guidelines and standards.</li>
        </ul>
      </section>
    </motion.div>
  );
}

function StaticFeatures({ isDarkMode }) {
  return (
    <section className="mt-6">
      <h3 className="text-xl font-semibold">Additional Features</h3>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <Link
          href="/ailawtools/flashcards"
          className={clsx(
            'border rounded-lg p-4 text-center transition-colors hover:shadow-lg',
            isDarkMode
              ? 'bg-slate-800 bg-opacity-50 border border-slate-700 text-white'
              : 'bg-white border border-gray-300 text-gray-800'
          )}
        >
          <h4 className="font-bold">Flashcards</h4>
          <p className="text-sm">Review key terms with interactive flashcards.</p>
        </Link>
        <Link
          href="/ailawtools/lexapi"
          className={clsx(
            'border rounded-lg p-4 text-center transition-colors hover:shadow-lg',
            isDarkMode
              ? 'bg-slate-800 bg-opacity-50 border border-slate-700 text-white'
              : 'bg-white border border-gray-300 text-gray-800'
          )}
        >
          <h4 className="font-bold">Quizzes</h4>
          <p className="text-sm">Test your knowledge with multiple-choice quizzes.</p>
        </Link>
        <Link
          href="/ailawtools/flashcards"
          className={clsx(
            'border rounded-lg p-4 text-center transition-colors hover:shadow-lg',
            isDarkMode
              ? 'bg-slate-800 bg-opacity-50 border border-slate-700 text-white'
              : 'bg-white border border-gray-300 text-gray-800'
          )}
        >
          <h4 className="font-bold">Outlines</h4>
          <p className="text-sm">Detailed outlines of criminal law doctrines and case law.</p>
        </Link>
      </div>
    </section>
  );
}

export default function CriminalSubjectGuide() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const [currentView, setCurrentView] = useState('overview');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { title: 'Felonies', items: ['Murder', 'Rape', 'Robbery', 'Arson', 'Kidnapping'] },
    { title: 'Misdemeanors', items: ['Petty Theft', 'Public Intoxication', 'Vandalism', 'Disorderly Conduct'] },
    { title: 'Defenses', items: ['Insanity', 'Self-Defense', 'Duress', 'Entrapment', 'Mistake of Fact'] },
    { title: 'Sentencing', items: ['Incarceration', 'Probation', 'Fines', 'Community Service', 'Restitution'] }
  ];

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

  const fillPercent = (currentSlide / (slides.length - 1)) * 100;
  const progressBarColor = isDarkMode ? 'bg-white' : 'bg-gray-600';

  const TimelineProgressBar = () => (
    <div className="flex items-center mb-4">
      <button
        onClick={handlePrevSlide}
        className={clsx(
          'mr-4 p-2 rounded-full transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800',
          { 'opacity-50 pointer-events-none': currentSlide === 0 }
        )}
      >
        <FaArrowLeft />
      </button>
      <div className="text-lg font-semibold mx-4 whitespace-nowrap">
        Criminal Subject Guide
      </div>
      <div className="ml-2 text-sm font-normal italic">
        {slides[currentSlide].title}
      </div>
      <div className="relative flex-1 h-1 rounded-full overflow-hidden mx-4">
        <motion.div
          className={clsx('absolute left-0 top-0 h-1', progressBarColor)}
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
        {slides.map((slide, index) => {
          const leftPercent = (index / (slides.length - 1)) * 100;
          const canJump = index <= currentSlide;
          return (
            <div
              key={slide.title}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftPercent}%`, top: '50%' }}
            >
              <div
                onClick={() => { if (canJump) setCurrentSlide(index); }}
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
      <button
        onClick={handleNextSlide}
        className={clsx(
          'ml-4 p-2 rounded-full transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800',
          { 'opacity-50 pointer-events-none': currentSlide === slides.length - 1 }
        )}
      >
        <FaArrowRight />
      </button>
    </div>
  );

  const OverviewContent = () => (
    <motion.div
      className={clsx(
        'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
      )}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <TimelineProgressBar />
      <div className="space-y-4 leading-relaxed">
        <p>
          Welcome to the <strong>Criminal Law</strong> Subject Guide! This resource highlights major doctrines, key cases, and practical tools to help you master each area of criminal law: felonies, misdemeanors, defenses, and sentencing.
        </p>
        <ul className="list-disc ml-6">
          {slides[currentSlide].items.map((item, idx) => (
            <li
              key={idx}
              onClick={() => setCurrentView(slides[currentSlide].title)}
              className="cursor-pointer hover:underline text-blue-400"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8">
          Each slide covers a distinct area of criminal law. Explore interactive quizzes, scenario builders, and case analysis to deepen your understanding.
        </p>
        <StaticFeatures isDarkMode={isDarkMode} />
      </div>
    </motion.div>
  );

  const renderContent = () => {
    if (currentView === 'overview') return <OverviewContent />;
    if (currentView === 'Felonies')
      return <DetailedFelonies onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Misdemeanors')
      return <DetailedMisdemeanors onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Defenses')
      return <DetailedDefenses onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Sentencing')
      return <DetailedSentencing onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    return <OverviewContent />;
  };

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'text-white' : 'text-gray-800')}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar activeLink="/subjects/criminal" isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} />
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
