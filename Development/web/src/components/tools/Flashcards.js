'use client';
import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBars,
  FaTimes,
  FaSyncAlt,
  FaCheck,
  FaChevronDown,
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import FlashInsight from '../FlashcardInsightsPanel';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend
);

const studyYearMapping = [
  { value: '1L', label: '1L (Core Subjects)' },
  { value: '2L', label: '2L (Intermediate Subjects)' },
  { value: '3L', label: '3L (Advanced/Electives)' },
  { value: 'LLM', label: 'LLM (Postgrad)' },
];

const proficiencyMapping = [
  { value: 'Basic', label: 'Basic' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

const courseNameMapping = [
  'Contracts',
  'Torts',
  'Civil Procedure',
  'Criminal Law',
  'Property',
  'Constitutional Law',
  'Evidence',
  'Family Law',
  'Business Associations',
  'Wills & Trusts',
  'Professional Responsibility',
];

export default function AIExamFlashCard() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [flashcards, setFlashcards] = useState([]);
  const [answeredFlashcards, setAnsweredFlashcards] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [isFinalFeedbackModalOpen, setIsFinalFeedbackModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedMissedQuestions, setSavedMissedQuestions] = useState([]);
  const [isMissedQuestionsModalOpen, setIsMissedQuestionsModalOpen] = useState(false);
  const [studyConfig, setStudyConfig] = useState({
    studyYear: '1L',
    proficiency: 'Basic',
    courseName: 'Contracts',
    questionLimit: 5,
    timerMinutes: 2,
    resetTimerEveryQuestion: true,
    instantFeedback: false,
    includeExplanations: false,
    saveMissedQuestions: true,
  });
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = (minutes) => {
    if (timerRef.current) clearInterval(timerRef.current);
    let total = minutes * 60;
    setTimeLeft(total);
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          clearInterval(timerRef.current);
          setIsFinalFeedbackModalOpen(true);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  };

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const TimerDisplay = ({ totalMinutes }) => {
    const r = 40;
    const c = 2 * Math.PI * r;
    const prog = timeLeft / (totalMinutes * 60);
    const off = c - prog * c;
    return (
      <svg width={100} height={100}>
        <circle cx={50} cy={50} r={r} stroke={isDarkMode ? '#444' : '#eee'} strokeWidth={0} fill="transparent" />
        <circle
          cx={50}
          cy={50}
          r={r}
          stroke={isDarkMode ? '#4ade80' : '#10b981'}
          strokeWidth={2}
          fill="transparent"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={isDarkMode ? '#fff' : '#333'} fontSize="16">
          {formatTime()}
        </text>
      </svg>
    );
  };

  const nextFlashcard = () => {
    setIsAnswerRevealed(false);
    if (studyConfig.resetTimerEveryQuestion && studyConfig.timerMinutes > 0) {
      startTimer(studyConfig.timerMinutes);
    }
    if (
      answeredFlashcards.length + 1 >= Number(studyConfig.questionLimit) ||
      currentFlashcardIndex >= flashcards.length - 1
    ) {
      setIsFinalFeedbackModalOpen(true);
      return;
    }
    setCurrentFlashcardIndex((p) => p + 1);
  };

  const recordAnswer = (isCorrect) => {
    const q = flashcards[currentFlashcardIndex]?.question;
    if (answeredFlashcards.some((a) => a.question === q)) {
      nextFlashcard();
      return;
    }
    setAnsweredFlashcards((p) => [
      ...p,
      {
        question: q || '',
        answer: flashcards[currentFlashcardIndex]?.answer || '',
        correctAnswer: flashcards[currentFlashcardIndex]?.correctAnswer || '',
        isCorrect,
      },
    ]);
    if (!isCorrect && studyConfig.saveMissedQuestions) {
      setSavedMissedQuestions((p) => [...p, flashcards[currentFlashcardIndex]]);
    }
    if (studyConfig.instantFeedback) {
      setIsAnswerRevealed(true);
    } else {
      nextFlashcard();
    }
  };

  const saveflashProgress = async () => {
    const correct = answeredFlashcards.filter((c) => c.isCorrect).length;
    const total = answeredFlashcards.length;
    const key = studyConfig.courseName.replace(/\s+/g, '');
    const categories = { [key]: { correct, total } };
    try {
      await addDoc(collection(db, 'flashProgress'), {
        userId: currentUser.uid,
        examConfig: studyConfig,
        overallCorrect: correct,
        overallTotal: total,
        categories,
        answeredFlashcards,
        timestamp: Date.now(),
      });
      setHasSavedProgress(true);
    } catch {}
  };

  useEffect(() => {
    if (isFinalFeedbackModalOpen && !hasSavedProgress) {
      saveflashProgress();
    }
  }, [isFinalFeedbackModalOpen, hasSavedProgress]);

  const fetchSavedProgresses = async () => {
    try {
      const q = query(collection(db, 'flashProgress'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setSavedProgresses(arr);
    } catch {}
  };

  const openLoadProgressModal = () => {
    fetchSavedProgresses();
    setIsLoadProgressModalOpen(true);
  };
  const closeLoadProgressModal = () => setIsLoadProgressModalOpen(false);

  const handleLoadProgress = (prog) => {
    setStudyConfig(prog.examConfig);
    closeLoadProgressModal();
  };

  const handleDeleteProgress = async (id) => {
    try {
      await deleteDoc(doc(db, 'flashProgress', id));
      fetchSavedProgresses();
    } catch {}
  };

  const handleGenerateFlashcards = async () => {
    setIsLoading(true);
    setFlashcards([]);
    setAnsweredFlashcards([]);
    setCurrentFlashcardIndex(0);
    setIsAnswerRevealed(false);
    setIsConfigModalOpen(false);
    try {
      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: studyConfig }),
      });
      const { flashcards: fcs } = await res.json();
      setFlashcards(fcs);
      if (studyConfig.timerMinutes > 0) startTimer(studyConfig.timerMinutes);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const mainVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
  };

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'text-white' : 'text-gray-800')}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/flashcards"
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={() => setIsSidebarVisible(false)}
              isDarkMode={isDarkMode}
            />
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarVisible(false)}
            />
          </>
        )}
      </AnimatePresence>

      <div className="absolute top-6 right-[5%] z-[100] flex flex-col items-center gap-2 mt-4">
        <div className="flex flex-col items-center">
          <motion.button
            onClick={openLoadProgressModal}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white transition-all duration-200 gradientShadowHoverBlue"
          >
            <FaSyncAlt size={20} />
          </motion.button>
          <span className="text-xs mt-1">Load Saves</span>
        </div>
        <div className="flex flex-col items-center mt-4">
          <motion.button
            onClick={() => setIsConfigModalOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white transition-all duration-200 gradientShadowHoverBlue"
          >
            <FaChevronDown size={20} />
          </motion.button>
          <span className="text-xs mt-1">Configure</span>
        </div>
      </div>

      <main className="flex-1 flex flex-col px-2 relative z-200 h-screen">
        <div className="flex items-center justify-between">  
          <button  
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}  
            className={clsx(  
              'text-blue-900 dark:text-white p-2 rounded transition-colors hover:bg-black/10 focus:outline-none md:hidden'  
            )}  
            aria-label="Toggle Sidebar"  
          >  
            {isSidebarVisible ? <FaTimes size={20} /> : <FaBars size={20} />}  
          </button>  
        </div>  

        <motion.div
          className={clsx(
            'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
            isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
          )}
          variants={mainVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-full max-w-md mx-auto mb-4 flex justify-around">
            <motion.button
              className={clsx(
                'px-4 py-2 font-semibold transition-colors duration-300',
                activeTab === 'browse'
                  ? isDarkMode
                    ? 'text-white border-b-2 border-blue-400'
                    : 'text-blue-900 border-b-2 border-blue-900'
                  : isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-600'
              )}
              onClick={() => setActiveTab('browse')}
            >
              Flashcards
            </motion.button>
            <motion.button
              className={clsx(
                'px-4 py-2 font-semibold transition-colors duration-300',
                activeTab === 'favorites'
                  ? isDarkMode
                    ? 'text-white border-b-2 border-blue-400'
                    : 'text-blue-900 border-b-2 border-blue-900'
                  : isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-600'
              )}
              onClick={() => setActiveTab('favorites')}
            >
              Analysis
            </motion.button>
          </div>

          {activeTab === 'browse' && (
            <>
              <div className="flex flex-col items-center justify-center mb-4">
                <TimerDisplay totalMinutes={studyConfig.timerMinutes} />
              </div>
              {flashcards.length === 0 && !isLoading && (
                <div
                  className={clsx(
                    'w-full max-w-3xl p-6 rounded-lg shadow-md text-center mx-auto',
                    isDarkMode
                      ? 'bg-slate-800 bg-opacity-50 text-white'
                      : 'bg-white text-gray-800'
                  )}
                >
                  <p className={clsx('mb-4', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                    Click <span className="font-semibold">Configure</span> to begin your Flashcard Practice.
                  </p>
                  <p className={clsx('text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
                    <strong>Note:</strong> This is intended for law students to practice essay/MC questions.
                  </p>
                </div>
              )}
              {isLoading && <div className="w-full h-1 bg-blue-500 animate-pulse my-4" />}
              {flashcards.length > 0 && (
                <div className="flex justify-center">
                  <motion.div
                    key={currentFlashcardIndex}
                    className={clsx(
                      'relative w-full max-w-xl p-6 my-4 rounded-xl shadow-md mx-auto',
                      isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
                    )}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h2 className="text-xl mb-2 text-center">Question:</h2>
                    <p className="mb-4 text-center">
                      {flashcards[currentFlashcardIndex].question}
                    </p>
                    {isAnswerRevealed ? (
                      <>
                        <h3 className="text-lg mb-2 text-center text-blue-500">Answer:</h3>
                        <p className="mb-4 text-center">
                          {flashcards[currentFlashcardIndex].correctAnswer ||
                            flashcards[currentFlashcardIndex].answer}
                        </p>
                        <div className="mt-4 flex justify-center space-x-4">
                          <motion.button
                            onClick={() => recordAnswer(false)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                          >
                            <FaTimes size={18} />
                            <span>I Got It Wrong</span>
                          </motion.button>
                          <motion.button
                            onClick={() => recordAnswer(true)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                          >
                            <FaCheck size={18} />
                            <span>I Got It Right</span>
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-center">
                        <button
                          onClick={() => setIsAnswerRevealed(true)}
                          className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white"
                        >
                          Show Answer
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
              {flashcards.length > 0 && (
                <div className="mt-2 text-sm text-gray-400 text-center">
                  <p>
                    Questions Answered: {answeredFlashcards.length} /{' '}
                    {studyConfig.questionLimit}
                  </p>
                </div>
              )}
              {savedMissedQuestions.length > 0 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsMissedQuestionsModalOpen(true)}
                    className="px-4 py-2 rounded bg-gradient-to-r from-yellow-600 to-yellow-800 text-white"
                  >
                    Review Missed Questions ({savedMissedQuestions.length})
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'favorites' && <FlashInsight />}
        </motion.div>
      </main>

      <AnimatePresence>
        {isLoadProgressModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={clsx(
                'p-6 rounded-lg w-11/12 max-w-2xl shadow-lg overflow-y-auto',
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-2xl mb-4 text-center">Load Saved Progress</h2>
              {savedProgresses.length === 0 ? (
                <p className="text-center">No saved progress found.</p>
              ) : (
                <ul className="space-y-4">
                  {savedProgresses.map((prog) => (
                    <li
                      key={prog.id}
                      className={clsx(
                        'p-4 border rounded',
                        isDarkMode ? 'border-gray-700' : 'border-gray-300'
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-blue-400 mb-1">
                            Study Year: {prog.examConfig?.studyYear}
                          </p>
                          <p className="text-sm">
                            Proficiency: {prog.examConfig?.proficiency}
                          </p>
                          <p className="text-sm">
                            Course: {prog.examConfig?.courseName}
                          </p>
                          <p className="text-sm">
                            Questions: {prog.examConfig?.questionLimit}
                          </p>
                          <p className="text-sm">
                            Timer: {prog.examConfig?.timerMinutes || 0} min
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleLoadProgress(prog)}
                            className="h-10 w-20 rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(prog.id)}
                            className="h-10 w-20 rounded bg-red-600 text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-center mt-4">
                <button
                  onClick={closeLoadProgressModal}
                  className={clsx(
                    'h-10 px-4 py-2 rounded',
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-800'
                  )}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isFinalFeedbackModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={clsx(
                'p-6 rounded-lg w-11/12 max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto',
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-2xl mb-4 text-center">Final Feedback</h2>
              {answeredFlashcards.map((c, i) => (
                <div
                  key={i}
                  className={clsx(
                    'mb-4 p-4 rounded border',
                    isDarkMode ? 'border-gray-700' : 'border-gray-800'
                  )}
                >
                  <p className="text-center">
                    <strong>Q:</strong> {c.question}
                  </p>
                  <p className="text-center">
                    <strong>A:</strong> {c.correctAnswer || c.answer}
                  </p>
                  <p
                    className={clsx(
                      'mt-1 text-center font-bold',
                      c.isCorrect ? 'text-emerald-500' : 'text-red-500'
                    )}
                  >
                    {c.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </p>
                </div>
              ))}
              <div className="text-center mt-4">
                <button
                  onClick={() => setIsFinalFeedbackModalOpen(false)}
                  className={clsx(
                    'h-10 px-4 py-2 rounded',
                    isDarkMode ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
                  )}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMissedQuestionsModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={clsx(
                'p-6 rounded-lg w-11/12 max-w-2xl shadow-lg overflow-y-auto',
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-2xl mb-4 text-center">Missed Questions</h2>
              <ul className="space-y-4">
                {savedMissedQuestions.map((c, i) => (
                  <li key={i} className="p-4 border rounded">
                    <p className="text-center">
                      <strong>Q:</strong> {c.question}
                    </p>
                    <p className="text-center">
                      <strong>A:</strong> {c.correctAnswer || c.answer}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsMissedQuestionsModalOpen(false)}
                  className={clsx(
                    'h-10 px-4 py-2 rounded',
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-800'
                  )}
                >
                  Close
                </button>
                <Link
                  href="/ailawtools/insights"
                  className="h-10 px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-center"
                >
                  Flashcard Insights
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfigModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-scroll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={clsx(
                'w-11/12 max-w-lg p-6 rounded shadow-lg overflow-y-auto',
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-center w-full">Flashcard Configuration</h2>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className={clsx(
                    'text-gray-500 hover:text-gray-700',
                    isDarkMode ? 'hover:text-gray-300' : ''
                  )}
                >
                  ✕
                </button>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Year/Level:</label>
                <select
                  name="studyYear"
                  value={studyConfig.studyYear}
                  onChange={(e) =>
                    setStudyConfig({ ...studyConfig, studyYear: e.target.value })
                  }
                  className={clsx(
                    'w-full p-3 border rounded',
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  )}
                >
                  {studyYearMapping.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Proficiency:</label>
                <select
                  name="proficiency"
                  value={studyConfig.proficiency}
                  onChange={(e) =>
                    setStudyConfig({ ...studyConfig, proficiency: e.target.value })
                  }
                  className={clsx(
                    'w-full p-3 border rounded',
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  )}
                >
                  {proficiencyMapping.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Course/Subject:</label>
                <select
                  name="courseName"
                  value={studyConfig.courseName}
                  onChange={(e) =>
                    setStudyConfig({ ...studyConfig, courseName: e.target.value })
                  }
                  className={clsx(
                    'w-full p-3 border rounded',
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  )}
                >
                  {courseNameMapping.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Number of Flashcards:</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  name="questionLimit"
                  value={studyConfig.questionLimit}
                  onChange={(e) =>
                    setStudyConfig({ ...studyConfig, questionLimit: e.target.value })
                  }
                  className="w-full"
                />
                <p className="text-right">
                  Selected: {studyConfig.questionLimit}
                </p>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Timer (in minutes):</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  name="timerMinutes"
                  value={studyConfig.timerMinutes}
                  onChange={(e) =>
                    setStudyConfig({ ...studyConfig, timerMinutes: e.target.value })
                  }
                  className={clsx(
                    'w-full p-2 rounded',
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  )}
                />
              </div>
              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm">Reset Timer On Each Question</label>
                <input
                  type="checkbox"
                  name="resetTimerEveryQuestion"
                  checked={studyConfig.resetTimerEveryQuestion}
                  onChange={(e) =>
                    setStudyConfig({
                      ...studyConfig,
                      resetTimerEveryQuestion: e.target.checked,
                    })
                  }
                />
              </div>
              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm">Instant Feedback</label>
                <input
                  type="checkbox"
                  name="instantFeedback"
                  checked={studyConfig.instantFeedback}
                  onChange={(e) =>
                    setStudyConfig({ ...studyConfig, instantFeedback: e.target.checked })
                  }
                />
              </div>
              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm">Include Explanations</label>
                <input
                  type="checkbox"
                  name="includeExplanations"
                  checked={studyConfig.includeExplanations}
                  onChange={(e) =>
                    setStudyConfig({ ...studyConfig, includeExplanations: e.target.checked })
                  }
                />
              </div>
              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm">Save Missed Questions</label>
                <input
                  type="checkbox"
                  name="saveMissedQuestions"
                  checked={studyConfig.saveMissedQuestions}
                  onChange={(e) =>
                    setStudyConfig({ ...studyConfig, saveMissedQuestions: e.target.checked })
                  }
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleGenerateFlashcards}
                  className="h-12 w-56 rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white gradientShadowHoverBlue"
                >
                  Start Flashcards
                </button>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className={clsx(
                    'h-12 px-6 py-2 rounded gradientShadowHoverWhite',
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-800'
                  )}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
