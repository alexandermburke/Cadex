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

  const randomCases =
    cases.length > 3 ? [...cases].sort(() => Math.random() - 0.5).slice(0, 3) : cases;

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

/* ---------------------- StaticFeatures Component ---------------------- */
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

/* ==================== Detailed Felony Subcategory Views ==================== */
function DetailedMurderContent({ onBack, isDarkMode }) {
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
      <h2 className="text-2xl font-bold my-4">Murder</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Murder is the unlawful killing of another person with malice aforethought. This felony involves the deliberate or reckless disregard for human life.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedRapeContent({ onBack, isDarkMode }) {
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
      <h2 className="text-2xl font-bold my-4">Rape</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Rape is a forcible or coercive sexual assault that involves non-consensual penetration, classified as a grave felony due to its severe violation of personal autonomy.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedRobberyContent({ onBack, isDarkMode }) {
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
      <h2 className="text-2xl font-bold my-4">Robbery</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Robbery involves the theft of property with the use of force or intimidation. The presence of violence or threats distinguishes it from mere theft.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedArsonContent({ onBack, isDarkMode }) {
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
      <h2 className="text-2xl font-bold my-4">Arson</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Arson is the intentional or reckless setting of a fire to property. Due to the threat it poses to public safety and property, it is treated as a serious felony.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedKidnappingContent({ onBack, isDarkMode }) {
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
      <h2 className="text-2xl font-bold my-4">Kidnapping</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Kidnapping is the unlawful confinement or transportation of a person by force or coercion, typically with the intent to demand a ransom or cause harm.
        </p>
      </section>
    </motion.div>
  );
}

/* ------------------- Misdemeanors Subcategory Views ------------------- */
function DetailedPettyTheftContent({ onBack, isDarkMode }) {
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Petty Theft</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Petty theft involves the unlawful taking of property of relatively low value, typically resulting in minor penalties such as fines or short jail terms.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedPublicIntoxicationContent({ onBack, isDarkMode }) {
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Public Intoxication</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Public intoxication occurs when an individual’s behavior while under the influence disrupts public order or safety, leading to minor criminal sanctions.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedVandalismContent({ onBack, isDarkMode }) {
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Vandalism</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Vandalism is the intentional damage to or defacement of property. It is generally classified as a misdemeanor, though severe cases can attract felony charges.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedDisorderlyConductContent({ onBack, isDarkMode }) {
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Disorderly Conduct</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Disorderly conduct encompasses actions that disturb public peace or order, often resulting in minor charges such as fines or brief incarceration.
        </p>
      </section>
    </motion.div>
  );
}

/* ------------------- Defenses Subcategory Views ------------------- */
function DetailedInsanityContent({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Insanity</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          The insanity defense asserts that due to a severe mental disorder, the defendant lacked the capacity to form the intent required for a crime. It is used only when the mental state substantially impairs the defendant&apos;s ability to distinguish right from wrong.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedSelfDefenseContent({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Self-Defense</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Self-defense permits the use of reasonable force to protect oneself from an imminent threat. The force must be both necessary and proportionate to the threat faced.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedDuressContent({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Duress</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Duress is used as a defense when a defendant claims that they were compelled to commit a crime under threat or coercion that overrode their free will.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedEntrapmentContent({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Entrapment</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Entrapment occurs when law enforcement induces an otherwise law-abiding person to commit a criminal act that they would not have committed without such influence.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedMistakeOfFactContent({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Mistake of Fact</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Mistake of fact is asserted when a defendant’s honest but mistaken belief about a factual matter negates the requisite criminal intent.
        </p>
      </section>
    </motion.div>
  );
}

/* ------------------- Sentencing Subcategory Views ------------------- */
function DetailedIncarcerationContent({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Incarceration</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Incarceration involves confining a defendant in jail or prison as punishment for their crimes.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedProbationContent({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Probation</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Probation allows a defendant to remain in the community under strict conditions rather than being incarcerated.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedFinesContent({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Fines</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Fines are monetary penalties imposed as punishment for criminal offenses.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedCommunityServiceContent({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Community Service</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Community service requires the defendant to perform unpaid work for the benefit of the community as part of their sentence.
        </p>
      </section>
    </motion.div>
  );
}

function DetailedRestitutionContent({ onBack, isDarkMode }) {
  return (
    <motion.div 
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', 
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
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >Back to Overview</button>
        <a 
          href="https://cadexlaw.com/pricing" 
          target="_blank" rel="noopener noreferrer"
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}
        >Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Restitution</h2>
      <section className="mb-6 text-sm leading-relaxed">
        <p>
          Restitution is designed to prevent the defendant from profiting by their wrongful conduct by requiring them to return any benefits obtained at the expense of the victim.
        </p>
      </section>
    </motion.div>
  );
}

/* ============================== Overview & Navigation ============================== */
export default function CriminalSubjectGuide() {
  const router = useRouter();
  const { userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // "overview" is the default; currentView holds the exact subcategory (e.g., "Murder") when clicked.
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
                className={clsx('w-3 h-3 rounded-full border-2 border-white cursor-pointer',
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

  // OverviewContent now maps over the subcategory items and sets currentView when an item is clicked.
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
          Welcome to the <strong>Criminal Law</strong> Subject Guide! This resource highlights major doctrines, key cases, and practical tools to help you master criminal law subtopics: Felonies, Misdemeanors, Defenses, and Sentencing.
        </p>
        <ul className="list-disc ml-6">
          {slides[currentSlide].items.map((item, idx) => (
            <li 
              key={idx}
              onClick={() => setCurrentView(item)}
              className="cursor-pointer hover:underline text-blue-400"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8">
          Each slide covers a distinct area of criminal law. Explore interactive quizzes, scenario builders, and case analyses to deepen your understanding.
        </p>
        <StaticFeatures isDarkMode={isDarkMode} />
      </div>
    </motion.div>
  );

  const renderContent = () => {
    if (currentView === 'overview') return <OverviewContent />;

    // Felonies
    if (currentView === 'Murder') return <DetailedMurderContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Rape') return <DetailedRapeContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Robbery') return <DetailedRobberyContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Arson') return <DetailedArsonContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Kidnapping') return <DetailedKidnappingContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;

    // Misdemeanors
    if (currentView === 'Petty Theft') return <DetailedPettyTheftContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Public Intoxication') return <DetailedPublicIntoxicationContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Vandalism') return <DetailedVandalismContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Disorderly Conduct') return <DetailedDisorderlyConductContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;

    // Defenses
    if (currentView === 'Insanity') return <DetailedInsanityContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Self-Defense') return <DetailedSelfDefenseContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Duress') return <DetailedDuressContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Entrapment') return <DetailedEntrapmentContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Mistake of Fact') return <DetailedMistakeOfFactContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;

    // Sentencing
    if (currentView === 'Incarceration') return <DetailedIncarcerationContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Probation') return <DetailedProbationContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Fines') return <DetailedFinesContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Community Service') return <DetailedCommunityServiceContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Restitution') return <DetailedRestitutionContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    return <OverviewContent />;
  };

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500',
      isDarkMode ? 'text-white' : 'text-gray-800'
    )}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar activeLink="/subjects/criminal" isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} />
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
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
