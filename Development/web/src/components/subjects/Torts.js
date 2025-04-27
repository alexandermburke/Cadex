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

/* ---------------------- Static Features ---------------------- */
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
          <p className="text-sm">Detailed outlines of tort doctrines and case law.</p>
        </Link>
      </div>
    </section>
  );
}

/* ---------------------- Intentional Torts Subcategory Views ---------------------- */
function BatteryContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Battery</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Battery:</strong> Battery is the intentional and harmful or offensive physical contact with another person without their consent. It is a foundational intentional tort.
        </p>
        <p className="ml-4">
          The contact must be both intentional and harmful/offensive, and it need not cause physical injury as long as it violates the victim’s personal dignity.
        </p>
      </section>
    </motion.div>
  );
}

function AssaultContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Assault</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Assault:</strong> Assault is the act of intentionally creating a reasonable apprehension of imminent harmful or offensive contact. It differs from battery in that no physical contact need occur; the mere threat may suffice.
        </p>
        <p className="ml-4">
          The key element is the victim’s apprehension of imminent harm, judged by the perspective of a reasonable person.
        </p>
      </section>
    </motion.div>
  );
}

function FalseImprisonmentContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">False Imprisonment</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>False Imprisonment:</strong> This tort occurs when one person intentionally confines another without lawful justification and without the victim’s consent.
        </p>
        <p className="ml-4">
          The confinement must be complete, and even minimal restrictions on movement may qualify if they infringe on the victim’s liberty.
        </p>
      </section>
    </motion.div>
  );
}

function ConversionContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Conversion</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Conversion:</strong> Conversion is the wrongful exercise of control or dominion over the personal property of another, effectively depriving the owner of its use or possession.
        </p>
        <p className="ml-4">
          It requires an act that seriously interferes with another’s rights of ownership and possession.
        </p>
      </section>
    </motion.div>
  );
}

function IIEDContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Intentional Infliction of Emotional Distress (IIED)</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>IIED:</strong> IIED occurs when one party’s extreme and outrageous conduct intentionally or recklessly causes severe emotional distress in another. The standard is high—only conduct that shocks the conscience will suffice.
        </p>
      </section>
    </motion.div>
  );
}

/* ---------------------- Negligence Subcategory Views ---------------------- */
function DutyContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Duty of Care</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Duty:</strong> Duty represents the legal obligation for a party to adhere to a standard of reasonable care to prevent foreseeable harm to others.
        </p>
      </section>
    </motion.div>
  );
}

function BreachContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Breach</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Breach:</strong> Breach is the failure to meet the standard of care mandated by the duty. It involves either an act or an omission that falls short of what a reasonable person would have done.
        </p>
      </section>
    </motion.div>
  );
}

function CausationContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Causation</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Causation:</strong> Causation connects the breach of duty with the injury sustained. It involves both actual cause (“but-for” causation) and proximate cause (the foreseeability of the harm).
        </p>
      </section>
    </motion.div>
  );
}

function NegligenceDamagesContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Damages in Negligence</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Damages:</strong> In a negligence claim, damages are awarded to compensate the injured party for actual losses (compensatory damages) resulting from the breach of duty.
        </p>
      </section>
    </motion.div>
  );
}

/* ---------------------- Defenses Subcategory Views ---------------------- */
function ConsentContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Consent</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Consent:</strong> Consent is a defense asserting that the plaintiff voluntarily accepted the risk of harm, thereby barring or reducing a tort claim.
        </p>
      </section>
    </motion.div>
  );
}

function SelfDefenseContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Self-Defense</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Self-Defense:</strong> This defense allows the use of reasonable force to protect oneself from an imminent threat of harm. The force used must be proportional to the threat.
        </p>
      </section>
    </motion.div>
  );
}

function DefenseOfOthersContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Defense of Others</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Defense of Others:</strong> Extends the principles of self-defense to protect a third party from harm. The defender’s actions must be reasonable and necessary under the circumstances.
        </p>
      </section>
    </motion.div>
  );
}

function DefenseOfPropertyContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Defense of Property</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Defense of Property:</strong> Permits the use of reasonable force to protect one’s property from trespass or theft, but does not extend to lethal force unless absolutely necessary.
        </p>
      </section>
    </motion.div>
  );
}

function ComparativeNegligenceContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Comparative Negligence</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Comparative Negligence:</strong> Allocates fault between the parties, reducing the amount of damages awarded proportional to the plaintiff’s degree of fault.
        </p>
      </section>
    </motion.div>
  );
}

/* ---------------------- Damages Subcategory Views ---------------------- */
function CompensatoryDamagesContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Compensatory Damages</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Compensatory Damages:</strong> These are awarded to reimburse the plaintiff for actual losses—both economic and non-economic—that result directly from the defendant&apos;s wrongful act.
        </p>
      </section>
    </motion.div>
  );
}

function PunitiveDamagesContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Punitive Damages</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Punitive Damages:</strong> Awarded to punish the defendant for particularly egregious or malicious conduct and to deter similar behavior in the future.
        </p>
      </section>
    </motion.div>
  );
}

function NominalDamagesContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Nominal Damages</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Nominal Damages:</strong> Awarded when a legal wrong has occurred but no substantial loss is demonstrated, serving as a recognition of the violation.
        </p>
      </section>
    </motion.div>
  );
}

function RestitutionTortsContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Restitution</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Restitution:</strong> This remedy prevents unjust enrichment by requiring the wrongdoer to relinquish any benefit gained at the expense of the injured party.
        </p>
      </section>
    </motion.div>
  );
}

function LiquidatedDamagesTortsContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack} className={clsx(
          'px-4 py-2 rounded text-sm font-semibold transition-colors',
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        )}>Back to Overview</button>
        <a href="https://cadexlaw.com/pricing" target="_blank" rel="noopener noreferrer"
          className={clsx('px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-300 hover:bg-blue-400 text-gray-800'
          )}>Suggestions</a>
      </div>
      <h2 className="text-2xl font-bold my-4">Liquidated Damages</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Liquidated Damages:</strong> These are predetermined sums specified in a contract or statute that must be paid in the event of a breach, provided the amount is reasonable and not punitive.
        </p>
      </section>
    </motion.div>
  );
}

/* ---------------------- Overview & Navigation ---------------------- */
export default function TortsSubjectGuide() {
  const router = useRouter();
  const { userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // "overview" is the default; currentView now holds the exact subcategory string when an item is clicked.
  const [currentView, setCurrentView] = useState('overview');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { 
      title: 'Intentional Torts', 
      items: ['Battery', 'Assault', 'False Imprisonment', 'Conversion', 'IIED'] 
    },
    { 
      title: 'Negligence', 
      items: ['Duty', 'Breach', 'Causation', 'Damages'] 
    },
    { 
      title: 'Defenses', 
      items: ['Consent', 'Self-Defense', 'Defense of Others', 'Defense of Property', 'Comparative Negligence'] 
    },
    { 
      title: 'Damages', 
      items: ['Compensatory Damages', 'Punitive Damages', 'Nominal Damages', 'Restitution', 'Liquidated Damages'] 
    }
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
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800',
          { 'opacity-50 pointer-events-none': currentSlide === 0 }
        )}
      >
        <FaArrowLeft />
      </button>
      <div className="text-lg font-semibold mx-4 whitespace-nowrap">
        Torts Subject Guide
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
              <div onClick={() => { if (canJump) setCurrentSlide(index); }} 
                   className={clsx('w-3 h-3 rounded-full border-2 border-white cursor-pointer', index <= currentSlide ? 'bg-white' : 'bg-gray-400')}
                   title={slide.title} />
            </div>
          );
        })}
      </div>
      <button onClick={handleNextSlide}
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

  // The overview for Torts now sets currentView to the specific subcategory when an item is clicked.
  const OverviewContent = () => (
    <motion.div
      className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
        isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
      )}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <TimelineProgressBar />
      <div className="space-y-4 leading-relaxed">
        <p>
          Welcome to the <strong>Torts</strong> Subject Guide! This resource highlights major doctrines, key cases, and practical tools to help you master each area of tort law: Intentional Torts, Negligence, Defenses, and Damages.
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
          Each slide covers a distinct area of tort law. Explore interactive quizzes, scenario builders, and case analyses to deepen your understanding.
        </p>
        <StaticFeatures isDarkMode={isDarkMode} />
      </div>
    </motion.div>
  );

  // Render subcategory detail views based on currentView string.
  const renderContent = () => {
    if (currentView === 'overview') return <OverviewContent />;
    // Intentional Torts Subcategories
    if (currentView === 'Battery') return <BatteryContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Assault') return <AssaultContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'False Imprisonment') return <FalseImprisonmentContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Conversion') return <ConversionContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'IIED') return <IIEDContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    // Negligence Subcategories
    if (currentView === 'Duty') return <DutyContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Breach') return <BreachContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Causation') return <CausationContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Damages' && slides[currentSlide].title === 'Negligence')
      return <NegligenceDamagesContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    // Defenses Subcategories
    if (currentView === 'Consent') return <ConsentContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Self-Defense') return <SelfDefenseContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Defense of Others') return <DefenseOfOthersContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Defense of Property') return <DefenseOfPropertyContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Comparative Negligence') return <ComparativeNegligenceContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    // Damages Subcategories
    if (currentView === 'Compensatory Damages') return <CompensatoryDamagesContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Punitive Damages') return <PunitiveDamagesContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Nominal Damages') return <NominalDamagesContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Restitution')
      return <RestitutionTortsContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Liquidated Damages')
      return <LiquidatedDamagesTortsContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    return <OverviewContent />;
  };

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500',
      isDarkMode ? 'text-white' : 'text-gray-800'
    )}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar activeLink="/subjects/torts" isSidebarVisible={isSidebarVisible}
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
