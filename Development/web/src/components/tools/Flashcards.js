'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';

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
  // Add or remove as needed for your curriculum
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

  // Early return if user not logged in
  if (!currentUser) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-800'
        }`}
      >
        <div className="p-6 rounded shadow-md text-center">
          <p className="mb-4">Please log in to use this tool.</p>
          <button
            onClick={() => router.push('/login')}
            className={`px-4 py-2 rounded ${
              isDarkMode
                ? 'bg-blue-700 hover:bg-blue-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
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
    setFlashcards(progress.flashcards);
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
        body: JSON.stringify({ config: studyConfig }), // changed from examConfig to studyConfig
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

    // If instant feedback is toggled on, reveal the answer right away:
    if (studyConfig.instantFeedback) {
      setIsAnswerRevealed(true);
    } else {
      nextFlashcard();
    }
  };

  // Move to next flashcard
  const nextFlashcard = () => {
    setIsAnswerRevealed(false);
    // Reset timer if needed
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

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-800' : 'bg-transparent'} rounded shadow-md`}>
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/flashcards" // Adjust as needed
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

      <main className="flex-1 flex flex-col p-4 overflow-auto">
        {/* Top Bar */}
       <div className="flex items-center justify-between mb-6">
                <button
                  onClick={toggleSidebar}
                  className={`text-gray-600 hover:text-gray-400`}
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
                        <FaTimes size={24} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu-icon"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaBars size={24} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
          {/* Timer display */}
          <div className="text-lg font-semibold">
            {timeLeft > 0 ? `Time Left: ${formatTime()}` : ''}
          </div>

          {/* Buttons: Save, Load, Configure */}
          <div className="inline-flex flex-row flex-nowrap items-center gap-2 sm:gap-4">
            <button
              onClick={openLoadProgressModal}
              className={`group relative h-10 sm:h-12 w-28 sm:w-40 overflow-hidden rounded ${
                isDarkMode ? 'bg-blue-700' : 'bg-blue-950'
              } text-white duration-200 before:absolute before:right-0 before:top-0 before:h-full before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56 text-sm sm:text-base shadow-md`}
              aria-label="Load Progress"
            >
              Load Progress
            </button>
            <button
              onClick={openConfigModal}
              className={`group relative h-10 sm:h-12 w-28 sm:w-40 overflow-hidden rounded ${
                isDarkMode ? 'bg-blue-700' : 'bg-blue-950'
              } text-white duration-200 before:absolute before:right-0 before:top-0 before:h-full before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56 text-sm sm:text-base shadow-md`}
              aria-label="Configure Flashcards"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Main Flashcard Area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
          {/* No flashcards yet */}
          {flashcards.length === 0 && !isLoading && (
            <div
              className={`w-full max-w-3xl p-6 ${
                isDarkMode ? 'bg-slate-700' : 'bg-white'
              } rounded-lg shadow-md text-center`}
            >
              <h2
                className={`text-2xl font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-blue-900'
                }`}
              >
                No flashcards generated yet.
              </h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Click <strong>Configure</strong> to set up your flashcards.
              </p>
            </div>
          )}

          {/* Loading bar in place of text */}
          {isLoading && (
            <div className="w-full h-1 bg-blue-500 z-50 animate-pulse my-4" />
          )}

          {/* Display current flashcard */}
          {flashcards.length > 0 && currentFlashcard && (
            <motion.div
              key={currentFlashcardIndex}
              className={`relative w-full max-w-xl p-6 my-4 rounded-xl shadow-md ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-semibold mb-2">Question:</h2>
              <p className="mb-4">{currentFlashcard.question}</p>

              {isAnswerRevealed ? (
                <>
                  <h3 className="text-lg font-semibold mb-2 text-blue-500">Answer:</h3>
                  <p className="mb-4">
                    {currentFlashcard.correctAnswer || currentFlashcard.answer}
                  </p>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={markIncorrect}
                      className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                    >
                      I Got It Wrong
                    </button>
                    <button
                      onClick={markCorrect}
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
                    className={`px-4 py-2 rounded ${
                      isDarkMode
                        ? 'bg-blue-700 hover:bg-blue-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Show Answer
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Flashcard progress info */}
          {flashcards.length > 0 && (
            <div className="mt-2 text-sm text-gray-400">
              <p>
                Questions Answered: {answeredFlashcards.length} / {studyConfig.questionLimit}
              </p>
            </div>
          )}
        </div>
      </main>

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
              className={`p-6 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-screen ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-4">Load Saved Progress</h2>
              {savedProgresses.length === 0 ? (
                <p>No saved progress found.</p>
              ) : (
                <ul className="space-y-4">
                  {savedProgresses.map((prog) => (
                    <li
                      key={prog.id}
                      className={`p-4 border rounded ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-blue-400 mb-1">
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
                            className={`h-10 w-20 sm:w-24 overflow-hidden rounded ${
                              isDarkMode
                                ? 'bg-blue-700 hover:bg-blue-600'
                                : 'bg-blue-700 hover:bg-blue-800'
                            } text-white transition-colors duration-200 text-sm sm:text-base`}
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(prog.id)}
                            className="h-10 w-20 sm:w-24 overflow-hidden rounded bg-red-600 text-white transition-colors duration-200 hover:bg-red-700 text-sm sm:text-base"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-right mt-4">
                <button
                  onClick={closeLoadProgressModal}
                  className={`h-10 sm:h-12 px-4 py-2 rounded ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                  }`}
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
              className={`p-6 rounded-lg w-11/12 max-w-3xl shadow-lg max-h-[80vh] overflow-y-auto ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-4">Final Feedback</h2>
              {answeredFlashcards.map((card, idx) => (
                <div
                  key={idx}
                  className={`mb-4 p-4 rounded border ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-blue-400 mb-1">Flashcard {idx + 1}</p>
                  <p>
                    <strong>Question:</strong> {card.question}
                  </p>
                  <p>
                    <strong>Correct Answer:</strong> {card.correctAnswer}
                  </p>
                  <p
                    className={`font-bold mt-1 ${
                      card.isCorrect ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {card.isCorrect ? '✓ You got it right' : '✗ You got it wrong'}
                  </p>
                </div>
              ))}
              <div className="text-right mt-4">
                <button
                  onClick={closeFinalFeedbackModal}
                  className={`h-10 sm:h-12 px-4 py-2 rounded font-semibold ${
                    isDarkMode
                      ? 'bg-blue-700 hover:bg-blue-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
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
              className={`w-11/12 max-w-lg p-6 rounded shadow-lg overflow-y-auto ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Flashcard Configuration</h2>
                <button
                  onClick={closeConfigModal}
                  className={`text-gray-500 hover:text-gray-700 ${
                    isDarkMode ? 'hover:text-gray-300' : ''
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Study Year */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Year/Level:</label>
                <select
                  name="studyYear"
                  value={studyConfig.studyYear}
                  onChange={handleConfigChange}
                  className={`w-full p-3 border rounded ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  {studyYearMapping.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Proficiency (difficulty) */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Proficiency:</label>
                <select
                  name="proficiency"
                  value={studyConfig.proficiency}
                  onChange={handleConfigChange}
                  className={`w-full p-3 border rounded ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  }`}
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
                <label className="block font-semibold mb-1">Course/Subject:</label>
                <select
                  name="courseName"
                  value={studyConfig.courseName}
                  onChange={handleConfigChange}
                  className={`w-full p-3 border rounded ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  }`}
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
                <label className="block font-semibold mb-1">Number of Flashcards:</label>
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

              {/* Timer field (in minutes) */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Timer (in minutes):</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  name="timerMinutes"
                  value={studyConfig.timerMinutes}
                  onChange={handleConfigChange}
                  className={`w-full p-2 rounded ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  }`}
                  placeholder="Enter a time limit (e.g., 30)"
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
                <label className="font-semibold text-sm">Reset Timer On Each Question</label>
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
                <label className="font-semibold text-sm">
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
                <label className="font-semibold text-sm">Include Extended Explanations</label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                 <button
       type="button"
      onClick={handleGenerateFlashcards}
     className="relative h-12 w-full sm:w-56 overflow-hidden rounded bg-blue-950 text-white shadow-lg transition-colors duration-200 before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
     aria-label="Start Tutoring Session"
 >
  Start Flashcards
         <motion.span
     className="absolute right-4 top-3"
             initial={{ x: -10, opacity: 0 }}
                                 animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                              >
             <i className="fa-solid fa-arrow-right"></i>
               </motion.span>
                       </button>
                 <button
                    type="button"
                    onClick={closeConfigModal}
                    className={`h-10 sm:h-12 px-6 py-2 rounded ${
                      isDarkMode
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    } transition-colors duration-200 text-sm sm:text-base`}
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
