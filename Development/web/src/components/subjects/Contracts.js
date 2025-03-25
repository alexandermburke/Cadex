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

  const getCasePreview = (summary) => {
    if (typeof summary === 'object' && summary !== null) {
      return summary.facts || 'Case summary preview...';
    }
    return summary || 'Case summary preview...';
  };

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
          transition={{ duration: 0.3 }}
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

function DetailedFormation({ onBack, isDarkMode }) {
  return (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors', isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800')}>
          Back to Overview
        </button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer" className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors', isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800')}>
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Formation of Contracts</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          The formation of a valid contract requires a <strong>meeting of the minds</strong> between parties who intend to be legally bound. Key components include <em>Offer and Acceptance</em>, <em>Consideration</em>, <em>Mutual Assent</em>, and <em>Capacity</em>. Failure of any of these elements can render an agreement unenforceable.
        </p>
        <p>
          <strong>Offer:</strong> A clear proposal by one party (offeror) that manifests a willingness to enter into a bargain. Must be sufficiently definite and communicated to the offeree.
        </p>
        <p>
          <strong>Acceptance:</strong> An unequivocal agreement by the offeree to the terms of the offer. Acceptance must generally mirror the offer (mirror image rule), though modern approaches sometimes allow minor variances.
        </p>
        <p>
          <strong>Consideration:</strong> A bargained-for exchange where each party receives a legal benefit and incurs a legal detriment. Gift promises typically lack consideration.
        </p>
        <p>
          <strong>Mutual Assent:</strong> Both parties must manifest their agreement to the same terms at the same time (often tested through an objective standard).
        </p>
        <p>
          <strong>Capacity:</strong> Parties must have legal capacity to contract (e.g., not minors, mentally incompetent, or extremely intoxicated).
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Interactive Flowchart: Visually map out whether an offer and acceptance have occurred.</li>
          <li>Multiple-Choice Quiz: Test your knowledge of capacity, mutual assent, and more.</li>
          <li>Practice Scenarios: Hypotheticals with immediate feedback to reinforce the concept.</li>
        </ul>
      </section>
    </motion.div>
  );
}

function DetailedPerformanceBreach({ onBack, isDarkMode }) {
  return (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors', isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800')}>
          Back to Overview
        </button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer" className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors', isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800')}>
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Performance and Breach</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          After a contract is formed, parties must perform their obligations or risk breaching. Key concepts include <em>conditions precedent</em>, <em>substantial performance</em>, and distinguishing between material and minor breaches.
        </p>
        <p>
          <strong>Conditions:</strong> Events that must occur before a party’s performance becomes due. Failure of a condition can excuse performance.
        </p>
        <p>
          <strong>Substantial Performance:</strong> Performance that deviates only slightly from contract terms, allowing partial recovery (minus damages for the deviation).
        </p>
        <p>
          <strong>Material vs. Minor Breach:</strong> A material breach can excuse the non-breaching party from further performance, while a minor breach typically only entitles the non-breaching party to damages.
        </p>
        <p>
          <strong>Anticipatory Repudiation:</strong> Occurs when a party indicates they will not perform. The other party may suspend performance and sue for damages.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Flowchart: Evaluate if a breach is material or minor.</li>
          <li>Case Simulator: Input hypothetical facts to see if anticipatory repudiation applies.</li>
          <li>Interactive Timelines: Track the sequence of performance obligations.</li>
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
        <button onClick={onBack} className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors', isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800')}>
          Back to Overview
        </button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer" className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors', isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800')}>
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Defenses</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          Even if a contract is validly formed, certain defenses can make it void or voidable. Examples include duress, undue influence, misrepresentation, unconscionability, and violating the Statute of Frauds.
        </p>
        <p>
          <strong>Duress:</strong> When one party is forced to enter a contract under threat of harm.
        </p>
        <p>
          <strong>Undue Influence:</strong> Exploiting a relationship of trust or dominance to secure an unfair contract.
        </p>
        <p>
          <strong>Misrepresentation:</strong> An untrue statement of fact that induces the other party to enter the contract.
        </p>
        <p>
          <strong>Unconscionability:</strong> A contract so one-sided it shocks the conscience, often involving a lack of meaningful choice.
        </p>
        <p>
          <strong>Statute of Frauds:</strong> Certain types of contracts (e.g., sale of land, cannot be performed within a year) must be in writing.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Checklist: Evaluate each defense systematically (fact patterns, red flags).</li>
          <li>Case Analyzer: Input contract details to see if it violates the Statute of Frauds.</li>
          <li>Quick Reference Charts: Summaries of major defenses with examples and outcomes.</li>
        </ul>
      </section>
    </motion.div>
  );
}

function DetailedRemedies({ onBack, isDarkMode }) {
  return (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors', isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800')}>
          Back to Overview
        </button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer" className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors', isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800')}>
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Remedies</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          Remedies aim to put the injured party in the position they would have been in if the contract was performed. Common remedies include damages (compensatory, consequential, reliance), restitution, and specific performance.
        </p>
        <p>
          <strong>Expectation Damages:</strong> The primary measure, awarding the non-breaching party what they would have received if the contract was fully performed.
        </p>
        <p>
          <strong>Reliance Damages:</strong> Reimburses the plaintiff for expenses incurred in reliance on the contract.
        </p>
        <p>
          <strong>Restitution:</strong> Prevents unjust enrichment by returning the defendant’s gain to the plaintiff.
        </p>
        <p>
          <strong>Specific Performance:</strong> A court order compelling actual performance, typically reserved for unique goods or real property.
        </p>
        <p>
          <strong>Liquidated Damages:</strong> A contractual provision that sets a predetermined amount for breach, enforceable if it’s a reasonable estimate of potential loss.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Damages Calculator: Estimate expectation vs. reliance damages.</li>
          <li>Scenario Builder: Test if specific performance is warranted (real estate, unique goods).</li>
          <li>Liquidated Damages Validator: Check if a liquidated damages clause is likely enforceable.</li>
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
          href="/flashcards"
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
          href="/quizzes"
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
          href="/outlines"
          className={clsx(
            'border rounded-lg p-4 text-center transition-colors hover:shadow-lg',
            isDarkMode
              ? 'bg-slate-800 bg-opacity-50 border border-slate-700 text-white'
              : 'bg-white border border-gray-300 text-gray-800'
          )}
        >
          <h4 className="font-bold">Outlines</h4>
          <p className="text-sm">Detailed outlines of contract doctrines and case law.</p>
        </Link>
      </div>
    </section>
  );
}

export default function ContractsSubjectGuide() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const [currentView, setCurrentView] = useState('overview');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { title: 'Formation', items: ['Offer and Acceptance', 'Consideration', 'Mutual Assent', 'Capacity'] },
    { title: 'Performance Breach', items: ['Conditions', 'Substantial Performance', 'Material vs. Minor Breach', 'Anticipatory Repudiation'] },
    { title: 'Defenses', items: ['Duress', 'Undue Influence', 'Misrepresentation', 'Unconscionability', 'Statute of Frauds'] },
    { title: 'Remedies', items: ['Expectation Damages', 'Reliance Damages', 'Restitution', 'Specific Performance', 'Liquidated Damages'] }
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
        className={clsx('mr-4 p-2 rounded-full transition-colors', isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800', { 'opacity-50 pointer-events-none': currentSlide === 0 })}
      >
        <FaArrowLeft />
      </button>
      <div className="text-lg font-semibold mx-4 whitespace-nowrap">
        Contracts Subject Guide
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
            <div key={slide.title} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${leftPercent}%`, top: '50%' }}>
              <div
                onClick={() => { if (canJump) setCurrentSlide(index); }}
                className={clsx('w-3 h-3 rounded-full border-2 border-white cursor-pointer', index <= currentSlide ? 'bg-white' : 'bg-gray-400')}
                title={slide.title}
              />
            </div>
          );
        })}
      </div>
      <button
        onClick={handleNextSlide}
        className={clsx('ml-4 p-2 rounded-full transition-colors', isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800', { 'opacity-50 pointer-events-none': currentSlide === slides.length - 1 })}
      >
        <FaArrowRight />
      </button>
    </div>
  );

  const OverviewContent = () => (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <TimelineProgressBar />
      <div className="space-y-4 leading-relaxed">
        <p>
          Welcome to the <strong>Contracts</strong> Subject Guide! This resource highlights major doctrines, key cases, and practical tools to help you master each phase of a contract: formation, performance, defenses, and remedies.
        </p>
        <ul className="list-disc ml-6">
          {slides[currentSlide].items.map((item, idx) => (
            <li key={idx} onClick={() => setCurrentView(slides[currentSlide].title)} className="cursor-pointer hover:underline text-blue-400">
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8">
          Each slide covers a distinct stage of contract law. Explore interactive quizzes, scenario builders, and key case analysis to deepen your understanding.
        </p>
        <StaticFeatures isDarkMode={isDarkMode} />
      </div>
    </motion.div>
  );

  const renderContent = () => {
    if (currentView === 'overview') return <OverviewContent />;
    if (currentView === 'Formation') return <DetailedFormation onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Performance Breach') return <DetailedPerformanceBreach onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Defenses') return <DetailedDefenses onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Remedies') return <DetailedRemedies onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    return <OverviewContent />;
  };

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'text-white' : 'text-gray-800')}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar activeLink="/subjects/contracts" isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} />
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
