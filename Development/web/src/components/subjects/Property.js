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

function DetailedAcquisition({ onBack, isDarkMode }) {
  return (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onBack} 
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800')}
        >
          Back to Overview
        </button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800')}
        >
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Acquisition of Property</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          Property can be acquired in several ways including purchase, adverse possession, gift, or inheritance. Each method establishes different rights and responsibilities for the new owner.
        </p>
        <p>
          <strong>Purchase:</strong> Acquiring property through a sale or exchange.
        </p>
        <p>
          <strong>Adverse Possession:</strong> Gaining title by continuous, open, and notorious possession over a statutory period.
        </p>
        <p>
          <strong>Gift & Inheritance:</strong> Receiving property without consideration.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Interactive Flowchart: Map out methods of property acquisition.</li>
          <li>Multiple-Choice Quiz: Test your understanding of acquisition doctrines.</li>
          <li>Practice Scenarios: Review hypothetical property acquisition cases.</li>
        </ul>
      </section>
    </motion.div>
  );
}

function DetailedOwnership({ onBack, isDarkMode }) {
  return (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onBack} 
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800')}
        >
          Back to Overview
        </button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800')}
        >
          Suggestions
        </a>
      </div>
      <h2 className="text-2xl font-bold my-4">Ownership and Possession</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          Ownership of property confers the right to use, enjoy, and dispose of property. It encompasses full title, co-ownership, and rights related to easements.
        </p>
        <p>
          <strong>Title:</strong> Legal recognition of ownership.
        </p>
        <p>
          <strong>Possession:</strong> Actual control or occupancy of property.
        </p>
        <p>
          <strong>Easements:</strong> Rights to use another’s property for a specific purpose.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Interactive Diagram: Visualize different property interests.</li>
          <li>Quiz: Test your knowledge on ownership rights and easements.</li>
          <li>Case Studies: Analyze landmark property ownership cases.</li>
        </ul>
      </section>
    </motion.div>
  );
}

function DetailedTransfer({ onBack, isDarkMode }) {
  return (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
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
      <h2 className="text-2xl font-bold my-4">Transfer of Property</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          The transfer of property involves conveying title from one party to another. This process typically uses deeds, contracts, and other legal instruments, and may involve mortgages and liens.
        </p>
        <p>
          <strong>Deeds:</strong> Documents that legally transfer title.
        </p>
        <p>
          <strong>Contracts for Sale:</strong> Agreements that outline terms for transferring property.
        </p>
        <p>
          <strong>Mortgages & Liens:</strong> Financial interests that encumber property transfers.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Interactive Flowchart: Outline steps in property transfer.</li>
          <li>Multiple-Choice Quiz: Test your understanding of conveyance instruments.</li>
          <li>Scenario Builder: Analyze hypothetical property transfer situations.</li>
        </ul>
      </section>
    </motion.div>
  );
}

function DetailedLeases({ onBack, isDarkMode }) {
  return (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
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
      <h2 className="text-2xl font-bold my-4">Leases & Licenses</h2>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <p>
          Leases and licenses govern the temporary use of property. These agreements define the rights and obligations of landlords and tenants, including rental terms, maintenance duties, and eviction processes.
        </p>
        <p>
          <strong>Lease Agreements:</strong> Contracts that set rental terms.
        </p>
        <p>
          <strong>Licenses:</strong> Permissions to use property without transferring title.
        </p>
        <p>
          <strong>Landlord-Tenant Issues:</strong> Regulations that manage the relationship between property owners and occupants.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold">Case Examples</h3>
        <CaseCards collectionName="capCases" isDarkMode={isDarkMode} />
      </section>
      <section className="mb-6 space-y-2 text-sm leading-relaxed">
        <h3 className="text-xl font-semibold">Practice Tools & Features</h3>
        <ul className="list-disc ml-6">
          <li>Lease Simulator: Explore various leasing scenarios.</li>
          <li>Quiz: Test your understanding of landlord-tenant obligations.</li>
          <li>Interactive Timelines: Track key lease term events.</li>
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
          <p className="text-sm">Detailed outlines of property law doctrines and case law.</p>
        </Link>
      </div>
    </section>
  );
}

export default function PropertyLawSubjectGuide() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const [currentView, setCurrentView] = useState('overview');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { title: 'Acquisition', items: ['Purchase', 'Adverse Possession', 'Gift', 'Inheritance'] },
    { title: 'Ownership', items: ['Possession', 'Title', 'Co-ownership', 'Easements'] },
    { title: 'Transfer', items: ['Contracts for Sale', 'Deeds', 'Mortgages', 'Liens'] },
    { title: 'Leases & Licenses', items: ['Lease Agreements', 'Licenses', 'Landlord-Tenant Issues', 'Evictions'] }
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
        Property Law Subject Guide
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
          Welcome to the <strong>Property Law</strong> Subject Guide! This resource highlights major doctrines, key cases, and practical tools to help you master each area of property law: acquisition, ownership, transfer, and leases & licenses.
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
          Each slide covers a distinct area of property law. Explore interactive quizzes, scenario builders, and case analysis to deepen your understanding.
        </p>
        <StaticFeatures isDarkMode={isDarkMode} />
      </div>
    </motion.div>
  );

  const renderContent = () => {
    if (currentView === 'overview') return <OverviewContent />;
    if (currentView === 'Acquisition')
      return <DetailedAcquisition onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Ownership')
      return <DetailedOwnership onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Transfer')
      return <DetailedTransfer onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Leases & Licenses')
      return <DetailedLeases onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    return <OverviewContent />;
  };

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'text-white' : 'text-gray-800')}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar activeLink="/subjects/property" isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} />
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
