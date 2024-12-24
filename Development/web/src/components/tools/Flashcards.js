'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaSave } from 'react-icons/fa';

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

// Optional Chart.js imports if you wish to use charts in this component
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

// Difficulty & law type mappings (used in useEffect & config)
const difficultyMapping = {
  LSAT: [
    { value: 'Below 150', label: 'Below 150' },
    { value: '150-160', label: '150-160' },
    { value: '160-170', label: '160-170' },
    { value: '175+', label: '175+' },
  ],
  BAR: [
    { value: 'Below Average', label: 'Below Average' },
    { value: 'Average', label: 'Average' },
    { value: 'Above Average', label: 'Above Average' },
    { value: 'Expert', label: 'Expert' },
  ],
  MPRE: [
    { value: 'Basic', label: 'Basic' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
  ],
};

const lawTypeMapping = {
  LSAT: ['General Law'],
  BAR: [
    'General Law',
    'Criminal Law',
    'Civil Law',
    'Contracts',
    'Torts',
    'Constitutional Law',
    'Evidence',
    'Real Property',
    'Civil Procedure',
    'Business Associations (Corporations)',
    'Family Law',
    'Trusts and Estates',
    'Secured Transactions',
    'Negotiable Instruments',
    'Intellectual Property',
    'Professional Responsibility',
  ],
  MPRE: [
    'Professional Responsibility',
    'Ethics and Legal Responsibilities',
    'Disciplinary Actions',
    'Conflict of Interest',
    'Confidentiality',
    'Client Communication',
    'Fees and Trust Accounts',
    'Advertising and Solicitation',
    'Other Professional Conduct',
  ],
};

// LSAT question types (optional)
const logicalReasoningQuestionTypes = [
  'Assumption Questions',
  'Strengthen/Weaken Questions',
  'Flaw Questions',
  'Inference Questions',
  'Argument Method Questions',
  'Paradox Questions',
  'Parallel Reasoning Questions',
  'Point-at-Issue Questions',
  'Principle Questions',
  'Role Questions',
];
const readingComprehensionQuestionTypes = [
  'Main Idea/Primary Purpose Questions',
  'Method and Structure Questions',
  'Specific Passage Recall/Detail Questions',
  'Function Questions',
  'Inference Questions',
];

export default function AIExamFlashCard() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  // --- All Hooks and state declarations up top ---
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const [flashcards, setFlashcards] = useState([]);
  const [answeredFlashcards, setAnsweredFlashcards] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);

  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const [timerDuration, setTimerDuration] = useState(0); // minutes from config
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const timerRef = useRef(null);

  const [examConfig, setExamConfig] = useState({
    examType: 'LSAT',
    difficulty: '',
    lawType: 'General Law',
    questionLimit: 5,
    selectedQuestionTypes: [],
    timerMinutes: 2, // user sets in config
    resetTimerEveryQuestion: true, // toggle in config
  });

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [isFinalFeedbackModalOpen, setIsFinalFeedbackModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [difficultyOptions, setDifficultyOptions] = useState(difficultyMapping['LSAT']);
  const [lawTypeOptions, setLawTypeOptions] = useState(lawTypeMapping['LSAT']);

  // Update difficulty / law types when examType changes
  useEffect(() => {
    const newDiffOptions = difficultyMapping[examConfig.examType] || [];
    const newLawOptions = lawTypeMapping[examConfig.examType] || ['General Law'];

    setDifficultyOptions(newDiffOptions);
    setLawTypeOptions(newLawOptions);

    setExamConfig((prev) => ({
      ...prev,
      difficulty: newDiffOptions[0]?.value || '',
      lawType: newLawOptions[0] || 'General Law',
      selectedQuestionTypes: [],
    }));
  }, [examConfig.examType]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // --- Helper function to start / reset timer ---
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
          // Timer ended -> show final feedback
          setIsFinalFeedbackModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // --- Early return if user is not logged in ---
  if (!currentUser) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
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

  // --- Timer formatting ---
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // --- Save progress to Firestore ---
  const handleSaveProgress = async () => {
    if (!currentUser) {
      alert('You must be logged in to save progress.');
      return;
    }
    try {
      const progressData = {
        userId: currentUser.uid,
        examConfig,
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

  // --- Load progress logic ---
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
    setExamConfig(progress.examConfig);
    setFlashcards(progress.flashcards);
    setAnsweredFlashcards(progress.answeredFlashcards || []);
    setCurrentFlashcardIndex(progress.currentFlashcardIndex || 0);
    setTimerDuration(progress.timerDuration || 0);
    setTimeLeft(progress.timeLeft || 0);

    // Restart or continue timer if applicable
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

  // --- Configuration modal ---
  const openConfigModal = () => setIsConfigModalOpen(true);
  const closeConfigModal = () => setIsConfigModalOpen(false);

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleQuestionTypeChange = (e, type) => {
    const { checked } = e.target;
    setExamConfig((prev) => {
      let updated = [...prev.selectedQuestionTypes];
      if (checked) updated.push(type);
      else updated = updated.filter((t) => t !== type);
      return { ...prev, selectedQuestionTypes: updated };
    });
  };

  // --- Generate flashcards ---
  const handleGenerateFlashcards = async () => {
    setIsLoading(true); // show loading bar
    setFlashcards([]);
    setAnsweredFlashcards([]);
    setCurrentFlashcardIndex(0);
    setIsAnswerRevealed(false);
    closeConfigModal();

    try {
      // Mock API call (replace with your real endpoint)
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: examConfig }),
      });
      if (!response.ok) throw new Error('Failed generating');
      const { flashcards: newFCs } = await response.json();
      setFlashcards(newFCs);

      // Start timer if set
      setTimerDuration(examConfig.timerMinutes || 0);
      if (examConfig.timerMinutes > 0) {
        startTimer(examConfig.timerMinutes);
      }
    } catch (err) {
      console.error('Error generating flashcards:', err);
      alert('Error generating flashcards');
    } finally {
      setIsLoading(false); // hide loading bar
    }
  };

  // --- Flashcard logic ---
  const currentFlashcard = flashcards[currentFlashcardIndex] || null;
  const handleShowAnswer = () => setIsAnswerRevealed(true);

  const markCorrect = () => recordAnswer(true);
  const markIncorrect = () => recordAnswer(false);

  const recordAnswer = (isCorrect) => {
    // If already answered, skip
    const existing = answeredFlashcards.findIndex(
      (item) => item.question === currentFlashcard?.question
    );
    if (existing >= 0) {
      nextFlashcard();
      return;
    }
    setAnsweredFlashcards((prev) => [
      ...prev,
      {
        question: currentFlashcard?.question || '',
        correctAnswer: currentFlashcard?.correctAnswer || currentFlashcard?.answer || '',
        isCorrect,
      },
    ]);
    nextFlashcard();
  };

  const nextFlashcard = () => {
    setIsAnswerRevealed(false);
    // Reset timer each question if checked
    if (examConfig.resetTimerEveryQuestion && examConfig.timerMinutes > 0) {
      startTimer(examConfig.timerMinutes);
    }
    if (currentFlashcardIndex === flashcards.length - 1) {
      setIsFinalFeedbackModalOpen(true);
      return;
    }
    setCurrentFlashcardIndex((prev) => prev + 1);
  };

  const closeFinalFeedbackModal = () => setIsFinalFeedbackModalOpen(false);

  return (   
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded shadow-md`}>
      {/* Loading Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 z-50 animate-pulse" />
      )}

      {/* Sidebar */}
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

      <main className="flex-1 flex flex-col p-4 overflow-auto">
        {/* Top Bar */}
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-4">
          {/* Toggle Sidebar */}
          <button
            onClick={toggleSidebar}
            className={`text-gray-600 hover:text-gray-800 ${
              isDarkMode ? 'text-gray-200 hover:text-white' : ''
            }`}
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

          {/* Timer center */}
          <div className="text-lg font-semibold">
            {timeLeft > 0 ? `Time Left: ${formatTime()}` : ''}
          </div>

          {/* Buttons: Save, Load, Configure */}
          <div className="flex space-x-4">
            <button
              onClick={handleSaveProgress}
              className={`flex items-center px-4 py-2 rounded hover:bg-opacity-80 transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-blue-700 text-white hover:bg-blue-600'
                  : 'bg-blue-950 text-white hover:bg-blue-800'
              }`}
            >
              <FaSave className="mr-2" />
              Save
            </button>

            <button
              onClick={openLoadProgressModal}
              className={`group relative h-12 w-36 overflow-hidden rounded ${
                isDarkMode ? 'bg-blue-700' : 'bg-blue-950'
              } text-white shadow-2xl transition-all hover:text-slate-500`}
            >
              Load
            </button>

            <button
              onClick={openConfigModal}
              className={`group relative h-12 w-36 overflow-hidden rounded ${
                isDarkMode ? 'bg-blue-800' : 'bg-gradient-to-r from-blue-950 to-slate-700'
              } text-white shadow-2xl transition-all hover:text-slate-500`}
            >
              Configure
            </button>
          </div>
        </div>

        {/* Main Flashcard Area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
          {flashcards.length === 0 && !isLoading && (
            <div className="text-center p-6 rounded-lg border border-dashed">
              <p className="mb-2 text-lg">No flashcards generated yet.</p>
              <p className="text-sm text-gray-400">
                Click <strong>Configure</strong> to set up your exam and generate flashcards.
              </p>
            </div>
          )}

          {isLoading && (
            <p className="text-center mt-4 text-blue-500">
              Generating flashcards... Please wait.
            </p>
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
              <div className="absolute top-2 right-2 text-sm text-gray-500">
                {currentFlashcardIndex + 1} / {flashcards.length}
              </div>

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

          {/* If some answered, show progress */}
          {flashcards.length > 0 && (
            <div className="mt-2 text-sm text-gray-400">
              <p>
                Questions Answered: {answeredFlashcards.length} / {examConfig.questionLimit}
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
                            Exam Type: {prog.examConfig.examType}
                          </p>
                          <p className="text-sm">Difficulty: {prog.examConfig.difficulty}</p>
                          <p className="text-sm">
                            Questions: {prog.examConfig.questionLimit}
                          </p>
                          <p className="text-sm">
                            Timer: {prog.examConfig.timerMinutes || 0} min
                          </p>
                          <p className="text-sm">
                            Reset Timer: {prog.examConfig.resetTimerEveryQuestion ? 'Yes' : 'No'}
                          </p>
                          <p className="text-sm">
                            Saved on: {new Date(prog.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleLoadProgress(prog)}
                            className={`px-3 py-1 rounded ${
                              isDarkMode
                                ? 'bg-blue-700 hover:bg-blue-600'
                                : 'bg-blue-700 hover:bg-blue-800'
                            } text-white`}
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(prog.id)}
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
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
                  className={`px-4 py-2 rounded ${
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
                  className={`px-4 py-2 rounded font-semibold ${
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
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
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
                <button onClick={closeConfigModal} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              {/* Exam Type */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Exam Type:</label>
                <select
                  name="examType"
                  value={examConfig.examType}
                  onChange={handleConfigChange}
                  className={`w-full p-2 rounded ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  <option value="LSAT">LSAT</option>
                  <option value="BAR">BAR</option>
                  <option value="MPRE">MPRE</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Score Range:</label>
                <select
                  name="difficulty"
                  value={examConfig.difficulty}
                  onChange={handleConfigChange}
                  className={`w-full p-2 rounded ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  {difficultyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Law Type */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Law Type:</label>
                <select
                  name="lawType"
                  value={examConfig.lawType}
                  onChange={handleConfigChange}
                  className={`w-full p-2 rounded ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  {lawTypeOptions.map((lt) => (
                    <option key={lt} value={lt}>
                      {lt}
                    </option>
                  ))}
                </select>
              </div>

              {/* LSAT question types */}
              {examConfig.examType === 'LSAT' && (
                <div className="mb-4">
                  <p className="font-semibold text-sm text-gray-400">Logical Reasoning:</p>
                  {logicalReasoningQuestionTypes.map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={examConfig.selectedQuestionTypes.includes(type)}
                        onChange={(e) => handleQuestionTypeChange(e, type)}
                      />
                      {type}
                    </label>
                  ))}
                  <p className="font-semibold text-sm text-gray-400 mt-2">
                    Reading Comprehension:
                  </p>
                  {readingComprehensionQuestionTypes.map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={examConfig.selectedQuestionTypes.includes(type)}
                        onChange={(e) => handleQuestionTypeChange(e, type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              )}

              {/* Number of questions */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Number of Flashcards:</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  name="questionLimit"
                  value={examConfig.questionLimit}
                  onChange={handleConfigChange}
                  className="w-full"
                />
                <p className="text-right">Selected: {examConfig.questionLimit}</p>
              </div>

              {/* Timer field (in minutes) */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Timer (in minutes):</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  name="timerMinutes"
                  value={examConfig.timerMinutes}
                  onChange={handleConfigChange}
                  className={`w-full p-2 rounded ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  }`}
                  placeholder="Enter a time limit (e.g., 30)"
                />
                <p className="text-sm text-gray-400 mt-1">
                  If &gt; 0, a countdown starts once flashcards generate.
                </p>
              </div>

              {/* Reset Timer On Each Question */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="resetTimerEveryQuestion"
                  checked={examConfig.resetTimerEveryQuestion}
                  onChange={handleConfigChange}
                  className="mr-2"
                />
                <label className="font-semibold text-sm">Reset Timer On Each Question</label>
              </div>

              {/* Generate Button */}
              <div className="text-right">
                <button
                  onClick={handleGenerateFlashcards}
                  className={`mr-4 px-4 py-2 rounded ${
                    isDarkMode
                      ? 'bg-blue-700 hover:bg-blue-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate'}
                </button>
                <button
                  onClick={closeConfigModal}
                  className={`px-4 py-2 rounded ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                  }`}
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
