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

/* ------------------------------ StaticFeatures ------------------------------ */
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

const feedbackBlock = (
  <section className="mt-8 text-center">
    <div className="flex items-center justify-center space-x-4">
      <p className="">How can we improve this content?</p>
      <a
        href="/"
        className="group relative h-8 w-full sm:w-28 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow transition-all duration-300 flex items-center justify-center gradientShadowHoverBlue"
      >
        Feedback
      </a>
    </div>
  </section>
);

/* ------------------------------ Formation Subcategory Views ------------------------------ */
function OfferAndAcceptanceContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
      </div>
      <h2 className="text-2xl font-bold my-4">Offer and Acceptance</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Offer:</strong> An offer is more than a simple invitation—it is a well-defined and committed proposal that outlines the precise terms, conditions, and intentions of the offeror. It establishes the groundwork for any later negotiations and must be clear enough to indicate the seriousness of the commitment. By defining material terms such as price, quantity, and rights, the offer serves as the bedrock upon which contracts are built.
        </p>
        <p>
          When a party extends an offer, the language used can be instrumental in avoiding ambiguity. For example, even subtle differences in phrasing may indicate whether an offer is intended to be binding or whether it is merely a preliminary discussion. The clarity and specificity of the offer reduce potential disputes later on by ensuring that both parties have a consistent understanding of the proposed arrangement.
        </p>
        <p>
          From a legal standpoint, an offer must be communicated effectively and remain open until it is either revoked, accepted, or lapses according to any stated deadline. This temporal aspect of the offer is critical because it protects both the offeror from unexpected changes of heart and the offeree by preserving the offer&apos;s terms over a reasonable period.
        </p>
        <p>
          Additionally, the implications of an offer extend beyond just transactional details. It lays the foundation for trust and mutual understanding, setting the stage for a successful business relationship. By carefully considering the scope, clarity, and duration of the offer, parties establish a cooperative framework for negotiations.
        </p>
        <p>
          <strong>Acceptance:</strong> Acceptance transforms the offer into a binding contract through unequivocal agreement. It is not only a signal of assent but also a confirmation that the offeree fully understands and agrees to the terms set forth. When acceptance is communicated clearly—whether verbally, in writing, or through conduct—it signifies that both parties have reached a consensus.
        </p>
        <p>
          The method and timing of acceptance are equally important. The acceptance must mirror the offer’s terms without introducing any modifications unless agreed upon by both parties. This requirement, known as the mirror image rule, ensures that the contract&apos;s formation is based on mutual and precise agreement.
        </p>
        <p>
          Moreover, the acceptance should be relayed through a reliable medium, ensuring that the offeror receives it promptly. This efficient communication helps prevent misunderstandings that might arise from delayed or misinterpreted responses. In doing so, the acceptance solidifies the expectations of both parties regarding the mutual obligations under the contract.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function ConsiderationContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
      </div>
      <h2 className="text-2xl font-bold my-4">Consideration</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Consideration:</strong> The essence of any enforceable contract is the presence of consideration—a mutual exchange of value. This concept means that both parties must sacrifice or receive something of worth, which in turn gives the agreement binding force. Consideration distinguishes a legally enforceable contract from a mere gratuitous promise.
        </p>
        <p>
          In legal theory, consideration involves a benefit conferred on one side or a detriment suffered by the other. This reciprocal exchange reinforces fairness within the contractual relationship, ensuring that both parties have a stake in upholding their end of the bargain. Without this element, there is little to prevent one party from reneging on an agreement.
        </p>
        <p>
          Beyond the basic exchange, the quality and adequacy of consideration are critically analyzed by courts to ensure that the parties are not engaging in an unconscionable bargain. Even if the value exchanged is unequal, the presence of consideration often suffices as long as both parties have voluntarily agreed to the terms.
        </p>
        <p>
          Moreover, the role of consideration extends to complex arrangements involving non-monetary elements like promises, services, or even refraining from legal action. These aspects enrich the contractual landscape by accommodating various forms of reciprocal engagements, thereby enhancing the flexibility of contract law.
        </p>
        <p>
          Lastly, the doctrine of consideration encourages parties to think critically about the benefits and detriments inherent in their agreements. This reflective process not only bolsters the integrity of contractual commitments but also lays the foundation for equitable dispute resolution in the event of a breach.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function MutualAssentContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Mutual Assent</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Mutual Assent:</strong> Also known as the “meeting of the minds,” mutual assent is the foundation upon which a contract is built. This element requires that both parties fully and unambiguously agree to the exact terms. The clarity of this communication is essential, as any discrepancy can undermine the contract’s enforceability.
        </p>
        <p>
          In many cases, mutual assent is demonstrated through a series of negotiations where offers and acceptances are exchanged until a clear and final agreement is reached. This process highlights the importance of transparency and the need for both parties to discuss and understand every detail before finalizing the contract.
        </p>
        <p>
          Courts often scrutinize the communication process to determine whether the parties truly engaged in a meeting of the minds. This involves an objective examination of the statements, actions, and context in which the agreement was made. Where ambiguities exist, the potential for misunderstanding may void the contract or give rise to disputes.
        </p>
        <p>
          Furthermore, mutual assent is not merely about the exchange of words—it is about the genuine intent to create a legally binding agreement. By ensuring that both parties have a consistent understanding, mutual assent acts as a safeguard against any claims of deception or misunderstanding.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function CapacityContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Capacity</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Capacity:</strong> Capacity examines whether the parties involved have the legal and mental ability to enter into a contract. This includes considerations of age, mental competence, and in some cases, the presence of undue influence or coercion. The principle of capacity ensures that agreements are entered into voluntarily and with full understanding of their implications.
        </p>
        <p>
          Legal capacity is a safeguard that protects vulnerable individuals—such as minors or those with impaired judgment—from being exploited in contractual relationships. Courts have consistently held that agreements entered by parties lacking capacity may be rendered void or voidable, ensuring that only informed and capable parties are bound by a contract.
        </p>
        <p>
          In addition to traditional notions of capacity, modern contract law also recognizes issues arising from technological misunderstandings or illiteracy. These factors can affect a party’s ability to fully comprehend the terms and consequences of the contract, thereby influencing the court’s decision on enforceability.
        </p>
        <p>
          Overall, capacity is a crucial element that underpins the fairness and validity of contractual relations. It ensures that all parties are on an equal footing and capable of understanding the rights and obligations that the contract imposes.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

/* ------------------------------ Performance & Breach Subcategory Views ------------------------------ */
function ConditionsContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Conditions</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Conditions:</strong> Conditions act as triggers within contracts—specific events or facts that must occur before obligations become enforceable. They can be either a condition precedent, required before a party must perform, or a condition subsequent, which may nullify a contractual obligation if it occurs after performance has begun.
        </p>
        <p>
          The role of conditions is multifaceted; they not only signal when a contractual duty is activated but also provide a built-in mechanism for adjusting or excusing performance if certain events transpire. This allows parties to manage risk and uncertainty in their legal relationships.
        </p>
        <p>
          In practice, conditions often address issues such as financing, regulatory approvals, or other contingencies that could affect the performance of obligations. The specific language used to outline these conditions is critical, as any ambiguity can lead to disputes and potential litigation.
        </p>
        <p>
          Beyond these general points, conditions serve as a testament to the proactive nature of contract drafting. They encourage thorough planning by anticipating various scenarios, ultimately helping to balance the interests of both parties.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function SubstantialPerformanceContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Substantial Performance</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Substantial Performance:</strong> This doctrine recognizes that even if a party deviates slightly from the contract terms, they may still be considered as having performed their obligations if the essential purpose of the agreement is met. Courts rely on this principle to avoid enforcing perfection where minor discrepancies exist.
        </p>
        <p>
          When evaluating substantial performance, the courts consider whether any deviations have impacted the overall benefit that the non-breaching party expected. This means that only minor, non-essential breaches are overlooked, while significant deviations continue to be addressed under breach doctrines.
        </p>
        <p>
          In many jurisdictions, substantial performance provides a practical solution to disputes in which the performance falls short in minor ways. This legal concept ultimately ensures that parties do not receive an undue windfall while still promoting fairness and balance.
        </p>
        <p>
          Furthermore, the doctrine encourages parties to focus on the spirit rather than the letter of the contract. It supports flexibility in applying contractual terms and prevents parties from using trivial issues as a pretext to escape their obligations.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function MaterialVsMinorBreachContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Material vs. Minor Breach</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Material vs. Minor Breach:</strong> A material breach is one that strikes at the core of the contract, giving the non-breaching party the right to terminate the agreement and seek extensive remedies. In contrast, a minor breach, while still a breach, does not impair the contract’s overall purpose and typically results only in a claim for monetary compensation.
        </p>
        <p>
          Courts analyze the consequences of the breach on the contractual framework and the extent to which the intended benefits have been frustrated. This balanced inquiry considers the nature of the breached provision and its impact on the overall contractual performance.
        </p>
        <p>
          The distinction is critical in determining the proper remedy. A material breach may warrant termination and potentially punitive measures, whereas a minor breach usually leads to a limited award for the actual damages incurred.
        </p>
        <p>
          The evaluation process involves both objective evidence of performance and a subjective understanding of the parties’ expectations. This ensures that the legal remedy aligns closely with the underlying intent of the agreement.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function AnticipatoryRepudiationContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Anticipatory Repudiation</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Anticipatory Repudiation:</strong> This occurs when one party clearly states—either directly or by conduct—that it will not perform its contractual obligations when due. Such a declaration puts the non-breaching party on notice and allows them to treat the contract as having been breached.
        </p>
        <p>
          The legal significance of anticipatory repudiation lies in its ability to preclude waiting until the actual performance date. Instead, the non-breaching party can immediately seek remedies and make arrangements to mitigate any damages.
        </p>
        <p>
          Detailed analysis by courts typically involves assessing the clarity of the repudiatory statement and the timing of its occurrence relative to the performance deadline. If the repudiation is unequivocal, it justifies an immediate termination of the contract.
        </p>
        <p>
          This doctrine is designed to prevent the breaching party from benefiting from mere delay tactics, thereby safeguarding the expectations and interests of the non-breaching party.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

/* ------------------------------ Defenses Subcategory Views ------------------------------ */
function DuressContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Duress</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Duress:</strong> Duress exists when a party is compelled to act under the threat of harm—be it physical, economic, or psychological—in a way that vitiates free will and genuine consent. The presence of duress can entirely undermine the voluntary nature of the agreement.
        </p>
        <p>
          Legal analysis of duress examines the nature of the threats and the surrounding circumstances. Courts scrutinize whether the threats were so severe that the party’s decision to contract was no longer made freely. This protects individuals from being coerced into agreements that they would otherwise reject.
        </p>
        <p>
          In practical terms, evidence of duress may include instances where one party had significantly more power over the other, leading to an imbalanced negotiation process. This imbalance can ultimately render the contract voidable.
        </p>
        <p>
          By acknowledging the role of duress, contract law seeks to maintain fairness and uphold the principle that agreements must be entered into voluntarily, without external pressure.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function UndueInfluenceContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Undue Influence</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Undue Influence:</strong> Occurs when a person in a position of trust uses that power to manipulate another into a contractual agreement. This manipulation undermines genuine consent and can skew the balance of the negotiation process.
        </p>
        <p>
          The law recognizes undue influence by focusing on the relationship between the parties. When one party possesses both a fiduciary duty and a dominant position, any significant pressure exerted can be viewed as undermining the validity of their consent.
        </p>
        <p>
          Additionally, undue influence can be subtle, involving psychological pressure that erodes the offeree’s ability to evaluate the terms independently. Courts will closely examine the context to determine if the weaker party was indeed coerced by the stronger one.
        </p>
        <p>
          Ensuring that both parties enter agreements voluntarily is crucial in contract law, and the recognition of undue influence helps in maintaining that balance.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function MisrepresentationContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Misrepresentation</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Misrepresentation:</strong> This occurs when one party makes a false statement of fact that induces the other party to enter into a contract. Such a statement must be material to the agreement and can be either fraudulent or negligent in nature.
        </p>
        <p>
          In cases of fraudulent misrepresentation, the deceived party may be entitled to rescind the contract and claim damages. Courts evaluate not only the false statement but also the reliance on that statement at the time the contract was formed.
        </p>
        <p>
          The distinction between fraudulent and negligent misrepresentation is critical, as it affects the remedies available. An honest mistake can still undermine consent if a party relied on incorrect information that they should have verified.
        </p>
        <p>
          The overall aim of misrepresentation doctrine is to restore fairness by undoing the effects of deception. It encourages thorough disclosure and integrity during negotiations, thereby strengthening the foundation of contractual agreements.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function UnconscionabilityContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Unconscionability</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Unconscionability:</strong> This doctrine applies when a contract or a specific clause is so one-sided or oppressive that enforcing it would be fundamentally unfair. Courts scrutinize both the process by which the contract was formed and the substance of its terms.
        </p>
        <p>
          Procedural unconscionability focuses on issues such as coercion, deception, or significant imbalance in bargaining power, while substantive unconscionability examines the fairness of the contract terms themselves. When both elements are present, the contract may be held unenforceable.
        </p>
        <p>
          In many cases, unconscionability is invoked to prevent exploitation of a vulnerable party by a stronger, more dominant party. The law uses this doctrine to reinforce fairness and the equitable distribution of contractual risks.
        </p>
        <p>
          By applying the unconscionability standard, judges ensure that contracts maintain a balance between the parties’ interests and do not lead to oppressive or shocking outcomes.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function StatuteOfFraudsContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Statute of Frauds</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Statute of Frauds:</strong> The Statute of Frauds mandates that certain types of contracts be in writing to be enforceable. It primarily applies to contracts involving significant obligations such as land sales, long-term commitments, or agreements that cannot be performed within one year.
        </p>
        <p>
          The rationale behind the statute is to provide clarity and prevent fraud by ensuring that the most important aspects of the agreement are documented. A written record provides reliable evidence of the terms as they were understood by both parties.
        </p>
        <p>
          Additionally, the statute serves to protect parties from misunderstandings that may arise from oral agreements. By requiring a written contract, the parties are encouraged to negotiate more diligently and commit to terms that are clear and unambiguous.
        </p>
        <p>
          Overall, the Statute of Frauds acts as a safeguard against fraudulent claims and offers a framework for preserving the integrity of contractual agreements.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

/* ------------------------------ Remedies Subcategory Views ------------------------------ */
function ExpectationDamagesContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Expectation Damages</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Expectation Damages:</strong> Expectation damages aim to put the non-breaching party in the position it would have been in had the contract been fully performed. This remedy covers both direct losses and any consequential damages that were reasonably foreseeable at the time of contracting.
        </p>
        <p>
          In assessing expectation damages, courts often calculate the financial gain or benefit that the party expected to receive. This involves an examination of the contract’s terms and a projection of the anticipated performance.
        </p>
        <p>
          Moreover, the principle behind expectation damages is to ensure that the injured party is not left disadvantaged by the breach. By recovering these damages, the party is meant to be restored to the position it would have occupied if the contract had been properly executed.
        </p>
        <p>
          This calculation is both a reflection of the actual loss incurred and an estimation of the lost benefits, ensuring comprehensive compensation for the non-breaching party.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function RelianceDamagesContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Reliance Damages</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Reliance Damages:</strong> Reliance damages are designed to restore the injured party to the position it occupied before the contract was formed. This remedy reimburses expenses or losses incurred in preparation for or in reliance on the contractual agreement.
        </p>
        <p>
          By focusing on the outlays made in anticipation of the contract, reliance damages address the expenditures that were made in good faith. This can include costs related to preparations, investments, or other expenses that would not have been incurred if the contract had not been formed.
        </p>
        <p>
          Unlike expectation damages, which focus on the promised benefit, reliance damages are rooted in the actual expenditures made. This ensures that the party is not left financially disadvantaged by the breach.
        </p>
        <p>
          Overall, reliance damages serve as a practical remedy when the profitability of the contract is uncertain or difficult to quantify, ensuring fairness when the contract is invalidated.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function RestitutionContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Restitution</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Restitution:</strong> Restitution is a remedy designed to prevent unjust enrichment by returning benefits or monies that one party provided to another under a breached contract. Its primary goal is to restore fairness by undoing any windfall achieved through the performance.
        </p>
        <p>
          The principle of restitution focuses on the recovery of the value conferred rather than the expectation of profit. This ensures that the breaching party does not benefit from their failure to complete the contractual performance.
        </p>
        <p>
          Courts will examine the extent of the enrichment and the corresponding detriment suffered by the non-breaching party, thereby determining an appropriate measure of compensation that corrects the imbalance.
        </p>
        <p>
          As a result, restitution functions as a critical mechanism to maintain fairness, restoring the parties to the status quo ante where possible.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function SpecificPerformanceContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Specific Performance</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Specific Performance:</strong> This equitable remedy compels the breaching party to fulfill its exact obligations when monetary damages are deemed inadequate. It is most commonly applied when the subject matter of the contract is unique and cannot be easily substituted.
        </p>
        <p>
          Specific performance requires a careful judicial inquiry into the feasibility of compelling performance without undue hardship. Courts consider whether the contract’s terms can be precisely executed and if the non-breaching party would indeed receive the unique benefit promised.
        </p>
        <p>
          The remedy is typically reserved for cases involving real estate or rare items where the monetary equivalent of the promised performance would not suffice to compensate the injured party adequately.
        </p>
        <p>
          Ultimately, specific performance underscores the idea that in some cases, justice requires the actual fulfillment of promises rather than simple monetary compensation.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

function LiquidatedDamagesContent({ onBack, isDarkMode }) {
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
        <button onClick={onBack}
          className={clsx(
            'px-4 py-2 rounded text-sm font-semibold transition-colors',
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          )}
        >
          Back to Overview
        </button>
        
      </div>
      <h2 className="text-2xl font-bold my-4">Liquidated Damages</h2>
      <section className="mb-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>Liquidated Damages:</strong> These provisions specify a fixed sum that one party agrees to pay in the event of a breach, provided that the sum represents a reasonable forecast of likely damages. The purpose is to avoid protracted litigation over the actual damage incurred.
        </p>
        <p>
          For a liquidated damages clause to be enforceable, the predetermined amount must reflect a fair approximation of anticipated losses, rather than serving as a penalty. Courts critically assess the proportionality of the sum relative to the breach.
        </p>
        <p>
          In determining enforceability, judges examine the circumstances under which the contract was formed and whether the amount is genuinely compensatory. This evaluation safeguards against punitive measures disguised as liquidated damages.
        </p>
        <p>
          Ultimately, this remedy provides both parties with a predictable outcome, thereby reducing uncertainty and fostering efficient resolutions.
        </p>
      </section>
      {feedbackBlock}
    </motion.div>
  );
}

/* ------------------------------ Overview & Navigation ------------------------------ */
export default function ContractsSubjectGuide() {
  const router = useRouter();
  const { userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // "overview" is the default; currentView can be set to a specific subcategory string
  const [currentView, setCurrentView] = useState('overview');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { title: 'Formation', items: ['Offer and Acceptance', 'Consideration', 'Mutual Assent', 'Capacity'] },
    { title: 'Performance Breach', items: ['Conditions', 'Substantial Performance', 'Material vs. Minor Breach', 'Anticipatory Repudiation'] },
    { title: 'Defenses', items: ['Duress', 'Undue Influence', 'Misrepresentation', 'Unconscionability', 'Statute of Frauds'] },
    { title: 'Remedies', items: ['Expectation Damages', 'Reliance Damages', 'Restitution', 'Specific Performance', 'Liquidated Damages'] }
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
          { 'opacity-0 pointer-events-none': currentSlide === 0 }
        )}
      >
        <FaArrowLeft />
      </button>
      <div className="text-lg mx-4 whitespace-nowrap">
        <span className="text-blue-400 font-semibold">Subject Outlines</span> / Contracts
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
            <div key={slide.title}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftPercent}%`, top: '50%' }}
            >
              <div
                onClick={() => { if (canJump) setCurrentSlide(index); }}
                className={clsx('w-3 h-3 rounded-full border-2 border-white cursor-pointer', index <= currentSlide ? 'bg-white' : 'bg-gray-400')}
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

  // OverviewContent sets currentView to the subcategory string when an item is clicked
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
          Welcome to the <strong>Contracts</strong> Subject Guide! This resource highlights major doctrines, key cases, and practical tools to help you master each phase of a contract: Formation, Performance Breach, Defenses, and Remedies.
        </p>
        <ul className="list-disc ml-6">
          {slides[currentSlide].items.map((item, idx) => (
            <li key={idx} onClick={() => setCurrentView(item)} className="cursor-pointer hover:underline text-blue-400">
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
    if (currentView === 'Offer and Acceptance') return <OfferAndAcceptanceContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Consideration') return <ConsiderationContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Mutual Assent') return <MutualAssentContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Capacity') return <CapacityContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Conditions') return <ConditionsContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Substantial Performance') return <SubstantialPerformanceContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Material vs. Minor Breach') return <MaterialVsMinorBreachContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Anticipatory Repudiation') return <AnticipatoryRepudiationContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Duress') return <DuressContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Undue Influence') return <UndueInfluenceContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Misrepresentation') return <MisrepresentationContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Unconscionability') return <UnconscionabilityContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Statute of Frauds') return <StatuteOfFraudsContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Expectation Damages') return <ExpectationDamagesContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Reliance Damages') return <RelianceDamagesContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Restitution') return <RestitutionContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Specific Performance') return <SpecificPerformanceContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    if (currentView === 'Liquidated Damages') return <LiquidatedDamagesContent onBack={() => setCurrentView('overview')} isDarkMode={isDarkMode} />;
    return <OverviewContent />;
  };

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'text-white' : 'text-gray-800')}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar activeLink="/subjects/contracts" isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} />
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
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
