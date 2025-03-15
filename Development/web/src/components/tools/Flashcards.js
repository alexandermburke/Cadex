'use client';

import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaSyncAlt } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';
// Firebase
import { db } from '@/firebase';
import {
  doc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

// Auth
import { useAuth } from '@/context/AuthContext';

// Chart.js (Optional)
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

// Define possible selections for current law students
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

  // Sidebar
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // Flashcard states
  const [flashcards, setFlashcards] = useState([]);
  const [answeredFlashcards, setAnsweredFlashcards] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Timer states
  const [timerDuration, setTimerDuration] = useState(0); // in minutes
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef(null);

  // Configuration (repurposed for law students)
  const [studyConfig, setStudyConfig] = useState({
    studyYear: '1L',
    proficiency: 'Basic',
    courseName: 'Contracts',
    questionLimit: 5,
    timerMinutes: 2,
    resetTimerEveryQuestion: true,
    instantFeedback: false,
    includeExplanations: false,
  });

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [isFinalFeedbackModalOpen, setIsFinalFeedbackModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer logic
  const startTimer = (minutes) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const totalSeconds = minutes * 60;
    setTimeLeft(totalSeconds);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          // Timer ended
          setIsFinalFeedbackModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // If user is not logged in
  if (!currentUser) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center h-screen',
          isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-blue-950'
        )}
      >
        <div
          className={clsx(
            'p-6 rounded shadow-md text-center',
            isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-blue-950'
          )}
        >
          <p className="mb-4">Please log in to use this tool.</p>
          <button
            onClick={() => router.push('/login')}
            className={clsx(
              'px-4 py-2 rounded text-white',
              isDarkMode
                ? 'bg-blue-700 hover:bg-blue-600'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Format remaining time
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Save progress to Firestore
  const handleSaveProgress = async () => {
    if (!currentUser) {
      alert('You must be logged in to save progress.');
      return;
    }
    try {
      const progressData = {
        userId: currentUser.uid,
        studyConfig,
        flashcards,
        answeredFlashcards,
        currentFlashcardIndex,
        timestamp: new Date().toISOString(),
        timerDuration,
        timeLeft,
      };
      await addDoc(collection(db, 'examProgress'), progressData);
      alert('Progress saved!');
    } catch (err) {
      console.error('Error saving progress:', err);
      alert('Error saving progress');
    }
  };

  // Load progress logic
  const openLoadProgressModal = () => {
    fetchSavedProgresses();
    setIsLoadProgressModalOpen(true);
  };
  const closeLoadProgressModal = () => setIsLoadProgressModalOpen(false);

  const fetchSavedProgresses = async () => {
    try {
      const q = query(collection(db, 'examProgress'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const loaded = [];
      querySnapshot.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() }));
      setSavedProgresses(loaded);
    } catch (err) {
      console.error('Error fetching saves:', err);
      alert('Error fetching saves');
    }
  };

  const handleLoadProgress = (progress) => {
    setStudyConfig(progress.studyConfig);
    setFlashcards(progress.flashcards || []);
    setAnsweredFlashcards(progress.answeredFlashcards || []);
    setCurrentFlashcardIndex(progress.currentFlashcardIndex || 0);
    setTimerDuration(progress.timerDuration || 0);
    setTimeLeft(progress.timeLeft || 0);

    if (progress.flashcards?.length && progress.timerDuration) {
      startTimer(progress.timerDuration);
      setTimeLeft(progress.timeLeft || progress.timerDuration * 60);
    }
    closeLoadProgressModal();
  };

  const handleDeleteProgress = async (id) => {
    try {
      await deleteDoc(doc(db, 'examProgress', id));
      fetchSavedProgresses();
    } catch (err) {
      console.error('Error deleting progress:', err);
      alert('Error deleting progress');
    }
  };

  // Config modal
  const openConfigModal = () => setIsConfigModalOpen(true);
  const closeConfigModal = () => setIsConfigModalOpen(false);

  // Handle config form changes
  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudyConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Generate flashcards (calls your /api/generate-flashcards route)
  const handleGenerateFlashcards = async () => {
    setIsLoading(true);
    setFlashcards([]);
    setAnsweredFlashcards([]);
    setCurrentFlashcardIndex(0);
    setIsAnswerRevealed(false);
    closeConfigModal();

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: studyConfig }),
      });
      if (!response.ok) throw new Error('Failed generating');
      const { flashcards: newFCs } = await response.json();
      setFlashcards(newFCs);

      // Start timer if set
      setTimerDuration(studyConfig.timerMinutes || 0);
      if (studyConfig.timerMinutes > 0) {
        startTimer(studyConfig.timerMinutes);
      }
    } catch (err) {
      console.error('Error generating flashcards:', err);
      alert('Error generating flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  // Access the current flashcard
  const currentFlashcard = flashcards[currentFlashcardIndex] || null;

  // Reveal answer
  const handleShowAnswer = () => setIsAnswerRevealed(true);

  // Mark correct/incorrect
  const markCorrect = () => recordAnswer(true);
  const markIncorrect = () => recordAnswer(false);

  // Record an answer
  const recordAnswer = (isCorrect) => {
    const existingIndex = answeredFlashcards.findIndex(
      (item) => item.question === currentFlashcard?.question
    );
    if (existingIndex >= 0) {
      nextFlashcard();
      return;
    }
    setAnsweredFlashcards((prev) => [
      ...prev,
      {
        question: currentFlashcard?.question || '',
        answer: currentFlashcard?.answer || '',
        correctAnswer: currentFlashcard?.correctAnswer || '',
        isCorrect,
      },
    ]);

    if (studyConfig.instantFeedback) {
      setIsAnswerRevealed(true);
    } else {
      nextFlashcard();
    }
  };

  // Move to next flashcard
  const nextFlashcard = () => {
    setIsAnswerRevealed(false);
    if (studyConfig.resetTimerEveryQuestion && studyConfig.timerMinutes > 0) {
      startTimer(studyConfig.timerMinutes);
    }
    if (currentFlashcardIndex === flashcards.length - 1) {
      setIsFinalFeedbackModalOpen(true);
      return;
    }
    setCurrentFlashcardIndex((prev) => prev + 1);
  };

  // Final feedback modal
  const closeFinalFeedbackModal = () => setIsFinalFeedbackModalOpen(false);

  // FRAMER MOTION container for the main area
  const mainContainerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
  };

  return (
    <div
      className={clsx(
        'relative flex h-screen transition-colors duration-500',
        isDarkMode ? 'text-white' : 'text-gray-800'
      )}
    >
      {/* Sidebar + overlay (mobile) */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/flashcards"
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

      {/* Main content container remains unchanged */}
      <main className="flex-1 flex flex-col px-6 relative z-200 h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className={clsx(
              'text-blue-900 dark:text-white p-2 rounded transition-colors hover:bg-black/10 focus:outline-none md:hidden'
            )}
            aria-label={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isSidebarVisible ? (
                <motion.div
                  key="close-icon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaTimes size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="bars-icon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaBars size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Container for content */}
        <motion.div
          className={clsx(
            'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
            isDarkMode
              ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white'
              : 'bg-white text-blue-950'
          )}
          variants={mainContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top row: Timer and config buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg  text-center w-full">
              {timeLeft > 0 ? `Time Left: ${formatTime()}` : ''}
            </div>
            <div className="inline-flex flex-row flex-nowrap items-center gap-2 sm:gap-4">
              {/* Load Progress Button */}
              <button
                onClick={openLoadProgressModal}
                className={clsx(
                  'flex items-center justify-center w-10 h-10 rounded-full bg-transparent',
                  'hover:text-slate-200 transition-colors duration-200',
                  isDarkMode ? 'text-gray-200' : 'text-blue-950'
                )}
                aria-label="Load Progress"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaSyncAlt size={20} />
                </motion.div>
              </button>

              {/* Configure Button */}
              <button
                onClick={openConfigModal}
                className="group relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center"
                aria-label="Configure Flashcards"
              >
                Configure
              </button>
            </div>
          </div>

          {/* No flashcards generated */}
          {flashcards.length === 0 && !isLoading && (
            <div
              className={clsx(
                'w-full max-w-3xl p-6 rounded-lg shadow-md text-center mx-auto',
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-950'
              )}
            >
              <h2 className="text-2xl  mb-4">No flashcards generated yet.</h2>
              <p className={clsx(isDarkMode ? 'text-gray-300' : 'text-gray-500')}>
                Click <strong>Configure</strong> to set up your flashcards.
              </p>
            </div>
          )}

          {/* Loading bar */}
          {isLoading && (
            <div className="w-full h-1 bg-blue-500 z-50 animate-pulse my-4" />
          )}

          {/* Flashcard display */}
          {flashcards.length > 0 && flashcards[currentFlashcardIndex] && (
            <motion.div
              key={currentFlashcardIndex}
              className={clsx(
                'relative w-full max-w-xl p-6 my-4 rounded-xl shadow-md',
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-950'
              )}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl  mb-2 text-center">Question:</h2>
              <p className="mb-4 text-center">
                {flashcards[currentFlashcardIndex].question}
              </p>

              {isAnswerRevealed ? (
                <>
                  <h3 className="text-lg  mb-2 text-center text-blue-500">
                    Answer:
                  </h3>
                  <p className="mb-4 text-center">
                    {flashcards[currentFlashcardIndex].correctAnswer ||
                      flashcards[currentFlashcardIndex].answer}
                  </p>
                  <div className="mt-4 flex justify-center space-x-4">
                    <button
                      onClick={() => recordAnswer(false)}
                      className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                    >
                      I Got It Wrong
                    </button>
                    <button
                      onClick={() => recordAnswer(true)}
                      className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      I Got It Right
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={handleShowAnswer}
                    className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow hover:opacity-90 transition-all duration-200"
                  >
                    Show Answer
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Flashcard progress info */}
          {flashcards.length > 0 && (
            <div className="mt-2 text-sm text-gray-400 text-center">
              <p>
                Questions Answered: {answeredFlashcards.length} / {studyConfig.questionLimit}
              </p>
            </div>
          )}
        </motion.div>

        {/* Load Progress Modal */}
        <AnimatePresence>
          {isLoadProgressModalOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={clsx(
                  'p-6 rounded-lg w-11/12 max-w-2xl shadow-lg overflow-y-auto',
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-950'
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl  mb-4 text-center">Load Saved Progress</h2>
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
                            <p className=" text-blue-400 mb-1">
                              Study Year: {prog.studyConfig?.studyYear}
                            </p>
                            <p className="text-sm">Proficiency: {prog.studyConfig?.proficiency}</p>
                            <p className="text-sm">Course: {prog.studyConfig?.courseName}</p>
                            <p className="text-sm">Questions: {prog.studyConfig?.questionLimit}</p>
                            <p className="text-sm">
                              Timer: {prog.studyConfig?.timerMinutes || 0} min
                            </p>
                            <p className="text-sm">
                              Reset Timer:{' '}
                              {prog.studyConfig?.resetTimerEveryQuestion ? 'Yes' : 'No'}
                            </p>
                            <p className="text-sm">
                              Instant Feedback:{' '}
                              {prog.studyConfig?.instantFeedback ? 'Yes' : 'No'}
                            </p>
                            <p className="text-sm">
                              Saved on: {new Date(prog.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleLoadProgress(prog)}
                              className="h-10 w-20 sm:w-24 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white transition-all duration-200 text-sm sm:text-base flex items-center justify-center"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleDeleteProgress(prog.id)}
                              className="h-10 w-20 sm:w-24 overflow-hidden rounded bg-red-600 text-white transition-colors duration-200 hover:bg-red-700 text-sm sm:text-base flex items-center justify-center"
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
                      'h-10 sm:h-12 px-4 py-2 rounded',
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-blue-950'
                    )}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final Feedback Modal */}
        <AnimatePresence>
          {isFinalFeedbackModalOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={clsx(
                  'p-6 rounded-lg w-11/12 max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto',
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-950'
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl  mb-4 text-center">Final Feedback</h2>
                {answeredFlashcards.map((card, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      'mb-4 p-4 rounded border',
                      isDarkMode ? 'border-gray-700' : 'border-gray-300'
                    )}
                  >
                    <p className={clsx(' mb-1', isDarkMode ? 'text-blue-300' : 'text-blue-900')}>
                      Flashcard {idx + 1}
                    </p>
                    <p className="text-center">
                      <strong>Question:</strong> {card.question}
                    </p>
                    <p className="text-center">
                      <strong>Answer:</strong> {card.correctAnswer || card.answer}
                    </p>
                    <p className={clsx('font-bold mt-1 text-center', card.isCorrect ? 'text-emerald-500' : 'text-red-500')}>
                      {card.isCorrect ? '✓ You got it right' : '✗ You got it wrong'}
                    </p>
                  </div>
                ))}
                <div className="text-center mt-4">
                  <button
                    onClick={closeFinalFeedbackModal}
                    className={clsx(
                      'h-10 sm:h-12 px-4 py-2 rounded ',
                      isDarkMode
                        ? 'bg-blue-700 hover:bg-blue-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    )}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Configuration Modal */}
        <AnimatePresence>
          {isConfigModalOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-scroll"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={clsx(
                  'w-11/12 max-w-lg p-6 rounded shadow-lg overflow-y-auto',
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-blue-950'
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl  text-center w-full">Flashcard Configuration</h2>
                  <button
                    onClick={closeConfigModal}
                    className={clsx(
                      'text-gray-500 hover:text-gray-700',
                      isDarkMode ? 'hover:text-gray-300' : ''
                    )}
                  >
                    ✕
                  </button>
                </div>

                {/* Study Year */}
                <div className="mb-4">
                  <label className="block  mb-1">Year/Level:</label>
                  <select
                    name="studyYear"
                    value={studyConfig.studyYear}
                    onChange={handleConfigChange}
                    className={clsx(
                      'w-full p-3 border rounded',
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                    )}
                  >
                    {studyYearMapping.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Proficiency */}
                <div className="mb-4">
                  <label className="block  mb-1">Proficiency:</label>
                  <select
                    name="proficiency"
                    value={studyConfig.proficiency}
                    onChange={handleConfigChange}
                    className={clsx(
                      'w-full p-3 border rounded',
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                    )}
                  >
                    {proficiencyMapping.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Name */}
                <div className="mb-4">
                  <label className="block  mb-1">Course/Subject:</label>
                  <select
                    name="courseName"
                    value={studyConfig.courseName}
                    onChange={handleConfigChange}
                    className={clsx(
                      'w-full p-3 border rounded',
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                    )}
                  >
                    {courseNameMapping.map((course, idx) => (
                      <option key={idx} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of flashcards */}
                <div className="mb-4">
                  <label className="block  mb-1">Number of Flashcards:</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    name="questionLimit"
                    value={studyConfig.questionLimit}
                    onChange={handleConfigChange}
                    className="w-full"
                  />
                  <p className="text-right">Selected: {studyConfig.questionLimit}</p>
                </div>

                {/* Timer field (minutes) */}
                <div className="mb-4">
                  <label className="block  mb-1">Timer (in minutes):</label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    name="timerMinutes"
                    value={studyConfig.timerMinutes}
                    onChange={handleConfigChange}
                    className={clsx(
                      'w-full p-2 rounded',
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                    )}
                    placeholder="Enter a time limit (e.g. 30)"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    If &gt; 0, a countdown starts once flashcards are generated.
                  </p>
                </div>

                {/* Reset Timer On Each Question */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="resetTimerEveryQuestion"
                    checked={studyConfig.resetTimerEveryQuestion}
                    onChange={handleConfigChange}
                    className="mr-2"
                  />
                  <label className=" text-sm">Reset Timer On Each Question</label>
                </div>

                {/* Instant Feedback */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="instantFeedback"
                    checked={studyConfig.instantFeedback}
                    onChange={handleConfigChange}
                    className="mr-2"
                  />
                  <label className=" text-sm">
                    Instant Feedback (reveal answer immediately upon marking correct/wrong)
                  </label>
                </div>

                {/* Include Explanations */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="includeExplanations"
                    checked={studyConfig.includeExplanations}
                    onChange={handleConfigChange}
                    className="mr-2"
                  />
                  <label className=" text-sm">Include Extended Explanations</label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleGenerateFlashcards}
                    className="relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center"
                    aria-label="Start Flashcards"
                  >
                    Start Flashcards
                  </button>
                  <button
                    type="button"
                    onClick={closeConfigModal}
                    className={clsx(
                      'h-10 sm:h-12 px-6 py-2 rounded text-sm sm:text-base transition-colors duration-200',
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-300 text-blue-950 hover:bg-gray-400'
                    )}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
