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

/* -------------------- StaticFeatures Component -------------------- */
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
          <p className="text-sm">Detailed outlines of constitutional law doctrines and case law.</p>
        </Link>
      </div>
    </section>
  );
}

/* -------------------- Detailed Subcategory Components -------------------- */

/* Judicial Review */
function DetailedJudicialReview({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
      )}
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onBack} 
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white'
                      : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Judicial Review</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          Judicial review is the power of the courts to examine legislative and executive actions for constitutionality. Landmark cases like <strong>Marbury v. Madison</strong> established this principle.
        </p>
        <p>
          <strong>Constitutional Interpretation:</strong> Approaches include originalism, textualism, and the living Constitution method.
        </p>
        <p>
          <strong>Checks and Balances:</strong> Judicial review acts as an essential check on the powers of the legislative and executive branches.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Interactive Flowchart: Map the process of judicial review.</li>
          <li>Quiz: Test your understanding of landmark constitutional cases.</li>
          <li>Practice Scenarios: Analyze hypothetical constitutional challenges.</li>
        </ul>
      </section>
    </motion.div>
  );
}

/* Separation of Powers */
function DetailedSeparationOfPowers({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
      )}
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onBack} 
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white'
                      : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Separation of Powers</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          The Constitution divides government into three branches—legislative, executive, and judicial—to prevent any single branch from amassing too much power.
        </p>
        <p>
          <strong>Legislative:</strong> The branch responsible for enacting laws.
        </p>
        <p>
          <strong>Executive:</strong> The branch tasked with enforcing laws.
        </p>
        <p>
          <strong>Judicial:</strong> The branch interpreting laws and resolving disputes.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Interactive Diagram: Visualize the roles of the three branches.</li>
          <li>Quiz: Test your understanding of checks and balances.</li>
          <li>Case Analysis: Review landmark separation of powers cases.</li>
        </ul>
      </section>
    </motion.div>
  );
}

/* Federalism */
function DetailedFederalism({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
      )}
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onBack} 
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white'
                      : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Federalism</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          Federalism divides power between the national government and the states. The Constitution delineates federal authority while reserving all other powers to the states.
        </p>
        <p>
          <strong>Supremacy Clause:</strong> Establishes that federal law is the supreme law of the land.
        </p>
        <p>
          <strong>Tenth Amendment:</strong> Reserves undelegated powers to the states.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Flowchart: Outline federal vs. state powers.</li>
          <li>Quiz: Test your knowledge of constitutional allocation of power.</li>
          <li>Scenario Builder: Analyze hypothetical federalism issues.</li>
        </ul>
      </section>
    </motion.div>
  );
}

/* Individual Rights */
function DetailedIndividualRights({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
      )}
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onBack} 
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white'
                      : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Individual Rights</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          Individual rights, as protected by the Constitution, safeguard citizens against government overreach. These rights include freedom of speech, due process, and equal protection.
        </p>
        <p>
          <strong>First Amendment:</strong> Protects freedom of expression and religion.
        </p>
        <p>
          <strong>Due Process:</strong> Guarantees fair legal procedures.
        </p>
        <p>
          <strong>Equal Protection:</strong> Ensures that no person is denied equal protection under the law.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Interactive Timeline: Review landmark cases on individual rights.</li>
          <li>Quiz: Test your understanding of constitutional protections.</li>
          <li>Case Analyzer: Explore hypothetical scenarios involving individual rights.</li>
        </ul>
      </section>
    </motion.div>
  );
}

/* ============================== Overview & Navigation ============================== */
export default function ConstitutionalSubjectGuide() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // "overview" is the default; currentView will be set to a specific subcategory when an item is clicked.
  const [currentView, setCurrentView] = useState('overview');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { title: 'Judicial Review', items: ['Marbury v. Madison', 'Constitutional Interpretation', 'Checks & Balances'] },
    { title: 'Separation of Powers', items: ['Legislative', 'Executive', 'Judicial'] },
    { title: 'Federalism', items: ['Supremacy Clause', 'Tenth Amendment', 'Commerce Clause'] },
    { title: 'Individual Rights', items: ['First Amendment', 'Due Process', 'Equal Protection'] }
  ];

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const fillPercent = (currentSlide / (slides.length - 1)) * 100;
  const progressBarColor = isDarkMode ? 'bg-white' : 'bg-gray-600';

  const TimelineProgressBar = () => (
    <div className="flex items-center mb-4">
      <button onClick={handlePrevSlide}
        className={clsx(
          'mr-4 p-2 rounded-full transition-colors',
          isDarkMode
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gray-300 hover:bg-gray-400 text-gray-800',
          { 'opacity-50 pointer-events-none': currentSlide === 0 }
        )}
      >
        <FaArrowLeft />
      </button>
      <div className="text-lg font-semibold mx-4 whitespace-nowrap">
        Constitutional Subject Guide
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
      <button onClick={handleNextSlide}
        className={clsx(
          'ml-4 p-2 rounded-full transition-colors',
          isDarkMode
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gray-300 hover:bg-gray-400 text-gray-800',
          { 'opacity-50 pointer-events-none': currentSlide === slides.length - 1 }
        )}
      >
        <FaArrowRight />
      </button>
    </div>
  );

  // OverviewContent displays the list of items for the current slide.
  // (For this implementation, clicking any item sets the current view to the slide title.)
  const OverviewContent = () => (
    <motion.div 
      className={clsx(
        'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
        isDarkMode
          ? 'bg-slate-800 bg-opacity-50 text-white'
          : 'bg-white text-gray-800'
      )}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <TimelineProgressBar />
      <div className="space-y-4 leading-relaxed">
        <p>
          Welcome to the <strong>Constitutional Law</strong> Subject Guide! This resource highlights major doctrines, key cases, and practical tools to help you master constitutional law topics: Judicial Review, Separation of Powers, Federalism, and Individual Rights.
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
          Each slide covers a distinct area of constitutional law. Explore interactive quizzes, scenario builders, and case analyses to deepen your understanding.
        </p>
        <StaticFeatures isDarkMode={isDarkMode} />
      </div>
    </motion.div>
  );

  const renderContent = () => {
    if (currentView === 'overview') return <OverviewContent />;
    if (currentView === 'Judicial Review')
      return <DetailedJudicialReview onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Separation of Powers')
      return <DetailedSeparationOfPowers onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Federalism')
      return <DetailedFederalism onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Individual Rights')
      return <DetailedIndividualRights onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    return <OverviewContent />;
  };

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'text-white' : 'text-gray-800')}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar activeLink="/subjects/constitutional" isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} />
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
      <main className="flex-1 flex flex-col px-2 relative z-200 h-screen">
        {renderContent()}
      </main>
    </div>
  );
}
