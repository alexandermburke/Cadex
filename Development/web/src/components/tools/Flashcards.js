'use client';
import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBars,
  FaTimes,
  FaSyncAlt,
  FaCheck,
  FaTimes as FaClose,
  FaChevronDown,
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import {
  doc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc,
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

const simplifyText = (text = '', maxLength = 100) => {
  if (!text) return 'Not provided.';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export default function AIExamFlashCard() {
  const router = useRouter();
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  // Sidebar & Flashcard state
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const [flashcards, setFlashcards] = useState([]);
  const [answeredFlashcards, setAnsweredFlashcards] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Timer state
  const [timerDuration, setTimerDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const [timerStyle, setTimerStyle] = useState('digital');

  // Modal states
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [isFinalFeedbackModalOpen, setIsFinalFeedbackModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Missed questions
  const [savedMissedQuestions, setSavedMissedQuestions] = useState([]);
  const [isMissedQuestionsModalOpen, setIsMissedQuestionsModalOpen] = useState(false);

  // Study configuration (including option to save missed questions)
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

  // NEW: Flag to ensure we save progress only once per session
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
          setIsFinalFeedbackModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const TimerDisplay = ({ timeLeft, totalMinutes }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / (totalMinutes * 60);
    const offset = circumference - progress * circumference;
    return (
      <div className="flex flex-col items-center">
        <svg width={100} height={100} className="relative">
          <circle
            cx={50}
            cy={50}
            r={radius}
            stroke={isDarkMode ? "#444" : "#eee"}
            strokeWidth={0}
            fill="transparent"
          />
          <circle
            cx={50}
            cy={50}
            r={radius}
            stroke={isDarkMode ? "#4ade80" : "#10b981"}
            strokeWidth={4}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isDarkMode ? "#fff" : "#333"}
            fontSize="16"
          >
            {formatTime()}
          </text>
        </svg>
      </div>
    );
  };

  const toggleTimerStyle = () => {
    setTimerStyle(timerStyle === 'digital' ? 'analog' : 'digital');
  };

  const nextFlashcard = () => {
    setIsAnswerRevealed(false);
    if (studyConfig.resetTimerEveryQuestion && studyConfig.timerMinutes > 0) {
      startTimer(studyConfig.timerMinutes);
    }
    if (answeredFlashcards.length + 1 >= Number(studyConfig.questionLimit)) {
      setIsFinalFeedbackModalOpen(true);
      return;
    }
    if (currentFlashcardIndex >= flashcards.length - 1) {
      setIsFinalFeedbackModalOpen(true);
      return;
    }
    setCurrentFlashcardIndex((prev) => prev + 1);
  };

  const handleShowAnswer = () => setIsAnswerRevealed(true);

  const recordAnswer = (isCorrect) => {
    const existingIndex = answeredFlashcards.findIndex(
      (item) => item.question === flashcards[currentFlashcardIndex]?.question
    );
    if (existingIndex >= 0) {
      nextFlashcard();
      return;
    }
    // Save the answer data (which insights will use)
    setAnsweredFlashcards((prev) => [
      ...prev,
      {
        question: flashcards[currentFlashcardIndex]?.question || '',
        answer: flashcards[currentFlashcardIndex]?.answer || '',
        correctAnswer: flashcards[currentFlashcardIndex]?.correctAnswer || '',
        isCorrect,
      },
    ]);
    // Save missed question if enabled
    if (!isCorrect && studyConfig.saveMissedQuestions) {
      const alreadySaved = savedMissedQuestions.some(
        (item) => item.question === flashcards[currentFlashcardIndex]?.question
      );
      if (!alreadySaved) {
        setSavedMissedQuestions((prev) => [...prev, flashcards[currentFlashcardIndex]]);
      }
    }
    if (studyConfig.instantFeedback) {
      setIsAnswerRevealed(true);
    } else {
      nextFlashcard();
    }
  };

  const parseTags = (tagsString) =>
    tagsString.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);

  const generateCitationsInText = (text) => {
    if (!autoCitationsOn) return text;
    return text.replace(/\b([A-Z][a-z]+ v\. [A-Z][a-z]+)/g, (match) => `${match} (Auto-Cited)`);
  };

  const handleAddAnalysis = async () => {
    if (!selectedFavorite) {
      alert('Please select a favorite case.');
      return;
    }
    if (!analysisTitle.trim() || !analysisDetails.trim()) {
      alert('Please provide both an analysis title and details.');
      return;
    }
    const tagsArray = parseTags(analysisTags);
    let finalDetails = generateCitationsInText(analysisDetails);
    const newVersion = { timestamp: Date.now(), details: finalDetails };
    const newAnalysis = {
      caseId: selectedFavorite.id,
      caseTitle: selectedFavorite.title,
      title: analysisTitle.trim(),
      versions: [newVersion],
      tags: tagsArray,
      dueDate: analysisDueDate,
      details: finalDetails.trim(),
      createdAt: Date.now(),
    };
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedAnalyses = [...(userDataObj.analyses || []), newAnalysis];
      await updateDoc(userDocRef, { analyses: updatedAnalyses });
      setSavedAnalyses(updatedAnalyses);
      setAnalysisTitle('');
      setAnalysisDetails('');
      setAnalysisTags('');
      setAnalysisDueDate('');
      alert('Analysis saved successfully!');
    } catch (err) {
      console.error('Error saving analysis:', err);
      alert('Error saving analysis.');
    }
  };

  const handleOpenAnalysis = (analysis) => {
    const caseMatch = favoriteCases.find((c) => c.id === analysis.caseId);
    setSelectedFavorite(caseMatch || null);
    setAnalysisTitle(analysis.title);
    setAnalysisDetails(analysis.details);
    setAnalysisTags(analysis.tags?.join(', ') || '');
    setAnalysisDueDate(analysis.dueDate || '');
  };

  const handleUpdateAnalysis = async (index) => {
    try {
      const analysisToUpdate = { ...savedAnalyses[index] };
      const updatedDetails = generateCitationsInText(analysisToUpdate.details);
      const newVersion = { timestamp: Date.now(), details: updatedDetails };
      analysisToUpdate.details = updatedDetails;
      analysisToUpdate.versions.push(newVersion);
      const updatedList = [...savedAnalyses];
      updatedList[index] = analysisToUpdate;
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { analyses: updatedList });
      setSavedAnalyses(updatedList);
      alert('Analysis updated (new version added)!');
    } catch (err) {
      console.error('Error updating analysis:', err);
      alert('Error updating analysis.');
    }
  };

  const handleDeleteAnalysis = async (index) => {
    try {
      const updatedList = [...savedAnalyses];
      updatedList.splice(index, 1);
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { analyses: updatedList });
      setSavedAnalyses(updatedList);
      alert('Analysis deleted.');
    } catch (err) {
      console.error('Error deleting analysis:', err);
      alert('Error deleting analysis.');
    }
  };

  const filteredAnalyses = savedAnalyses.filter((analysis) => {
    const query = searchQuery.toLowerCase();
    const inTitle = analysis.title.toLowerCase().includes(query);
    const inCaseTitle = analysis.caseTitle.toLowerCase().includes(query);
    const inTags = analysis.tags?.some((tag) => tag.toLowerCase().includes(query));
    return inTitle || inCaseTitle || inTags;
  });

  // --- New Functionality: Save exam progress for insights ---
  const saveExamProgress = async () => {
    // Compute overall correct count and total answers from the session
    const overallCorrect = answeredFlashcards.filter(card => card.isCorrect).length;
    const overallTotal = answeredFlashcards.length;
    // For simplicity, assume that all flashcards in this session pertain to the same law subject (studyConfig.courseName)
    const categories = {
      [studyConfig.courseName]: {
        correct: overallCorrect,
        total: overallTotal,
      },
    };

    try {
      await addDoc(collection(db, 'examProgress'), {
        userId: currentUser.uid,
        examConfig: studyConfig,
        overallCorrect,
        overallTotal,
        categories,
        answeredFlashcards, // Optionally include detailed responses
        timestamp: Date.now(),
      });
      setHasSavedProgress(true);
    } catch (error) {
      console.error('Error saving exam progress:', error);
      alert('Error saving exam progress.');
    }
  };

  // NEW: Save progress automatically when Final Feedback modal opens (i.e. session is complete)
  useEffect(() => {
    if (isFinalFeedbackModalOpen && !hasSavedProgress) {
      saveExamProgress();
    }
  }, [isFinalFeedbackModalOpen, hasSavedProgress]);

  // (Remaining functions for loading/deleting saved progress, config modal, etc., are kept as before.)
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

  const openLoadProgressModal = () => {
    fetchSavedProgresses();
    setIsLoadProgressModalOpen(true);
  };
  const closeLoadProgressModal = () => setIsLoadProgressModalOpen(false);

  const handleLoadProgress = (progress) => {
    setStudyConfig(progress.studyConfig);
    // Load additional progress data if needed
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

  const openConfigModal = () => setIsConfigModalOpen(true);
  const closeConfigModal = () => setIsConfigModalOpen(false);

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudyConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

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
      if (!response.ok) throw new Error('Failed generating flashcards');
      const { flashcards: newFCs } = await response.json();
      setFlashcards(newFCs);
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

  const currentFlashcard = flashcards[currentFlashcardIndex] || null;

  const mainContainerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
  };

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'text-white' : 'text-gray-800')}>
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

      {/* Buttons Container */}
      <div className="absolute top-6 right-[5%] z-[100] flex flex-col items-center gap-2 mt-4">
        <div className="flex flex-col items-center">
          <motion.button
            onClick={openLoadProgressModal}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white transition-all duration-200 gradientShadowHoverBlue"
            aria-label="Load Progress"
          >
            <FaSyncAlt size={20} />
          </motion.button>
          <span className="text-xs mt-1">Load Saves</span>
        </div>
        <div className="flex flex-col items-center mt-4">
          <motion.button
            onClick={openConfigModal}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white transition-all duration-200 gradientShadowHoverBlue"
            aria-label="Configure Flashcards"
          >
            <FaChevronDown size={20} />
          </motion.button>
          <span className="text-xs mt-1">Configure</span>
        </div>
      </div>

      <main className="flex-1 flex flex-col px-6 relative z-200 h-screen">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className={clsx('text-blue-900 dark:text-white p-2 rounded transition-colors hover:bg-black/10 focus:outline-none md:hidden')}
            aria-label={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isSidebarVisible ? (
                <motion.div key="close-icon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <FaTimes size={20} />
                </motion.div>
              ) : (
                <motion.div key="bars-icon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <FaBars size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <motion.div
          className={clsx(
            'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
            isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
          )}
          variants={mainContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-center justify-center mb-4">
            <TimerDisplay timeLeft={timeLeft} totalMinutes={studyConfig.timerMinutes} />
          </div>

          {flashcards.length === 0 && !isLoading && (
            <div className={clsx('w-full max-w-3xl p-6 rounded-lg shadow-md text-center mx-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}>
              <h2 className="text-2xl mb-4">No flashcards generated yet.</h2>
              <p className={clsx(isDarkMode ? 'text-gray-300' : 'text-gray-500')}>Click <strong>Configure</strong> to set up your flashcards.</p>
            </div>
          )}

          {isLoading && <div className="w-full h-1 bg-blue-500 animate-pulse my-4" />}

          {flashcards.length > 0 && flashcards[currentFlashcardIndex] && (
            <div className="flex justify-center">
              <motion.div
                key={currentFlashcardIndex}
                className={clsx('relative w-full max-w-xl p-6 my-4 rounded-xl shadow-md mx-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-xl mb-2 text-center">Question:</h2>
                <p className="mb-4 text-center">{flashcards[currentFlashcardIndex].question}</p>
                {isAnswerRevealed ? (
                  <>
                    <h3 className="text-lg mb-2 text-center text-blue-500">Answer:</h3>
                    <p className="mb-4 text-center">
                      {flashcards[currentFlashcardIndex].correctAnswer || flashcards[currentFlashcardIndex].answer}
                    </p>
                    <div className="mt-4 flex justify-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => recordAnswer(false)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transition-transform gradientShadowHoverWhite"
                      >
                        <FaTimes size={18} />
                        <span>I Got It Wrong</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => recordAnswer(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg transition-transform gradientShadowHoverWhite"
                      >
                        <FaCheck size={18} />
                        <span>I Got It Right</span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center">
                    <button
                      onClick={handleShowAnswer}
                      className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow hover:opacity-90 transition-all duration-200 gradientShadowHoverBlue"
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
              <p>Questions Answered: {answeredFlashcards.length} / {studyConfig.questionLimit}</p>
            </div>
          )}

          {savedMissedQuestions.length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsMissedQuestionsModalOpen(true)}
                className="px-4 py-2 rounded bg-gradient-to-r from-yellow-600 to-yellow-800 text-white shadow hover:opacity-90 transition-all duration-200"
              >
                Review Missed Questions ({savedMissedQuestions.length})
              </button>
            </div>
          )}
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
              className={clsx('p-6 rounded-lg w-11/12 max-w-2xl shadow-lg overflow-y-auto', isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800')}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl mb-4 text-center">Load Saved Progress</h2>
              {savedProgresses.length === 0 ? (
                <p className="text-center">No saved progress found.</p>
              ) : (
                <ul className="space-y-4">
                  {savedProgresses.map((prog) => (
                    <li
                      key={prog.id}
                      className={clsx('p-4 border rounded', isDarkMode ? 'border-gray-700' : 'border-gray-300')}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-blue-400 mb-1">Study Year: {prog.studyConfig?.studyYear}</p>
                          <p className="text-sm">Proficiency: {prog.studyConfig?.proficiency}</p>
                          <p className="text-sm">Course: {prog.studyConfig?.courseName}</p>
                          <p className="text-sm">Questions: {prog.studyConfig?.questionLimit}</p>
                          <p className="text-sm">Timer: {prog.studyConfig?.timerMinutes || 0} min</p>
                          <p className="text-sm">Reset Timer: {prog.studyConfig?.resetTimerEveryQuestion ? 'Yes' : 'No'}</p>
                          <p className="text-sm">Instant Feedback: {prog.studyConfig?.instantFeedback ? 'Yes' : 'No'}</p>
                          <p className="text-sm">Saved on: {new Date(prog.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleLoadProgress(prog)}
                            className="h-10 w-20 sm:w-24 rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base flex items-center justify-center transition-all duration-200"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(prog.id)}
                            className="h-10 w-20 sm:w-24 rounded bg-red-600 text-white text-sm sm:text-base flex items-center justify-center transition-colors duration-200 hover:bg-red-700"
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
                  className={clsx('h-10 sm:h-12 px-4 py-2 rounded', isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800')}
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
              className={clsx('p-6 rounded-lg w-11/12 max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto', isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800')}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl mb-4 text-center">Final Feedback</h2>
              {answeredFlashcards.map((card, idx) => (
                <div key={idx} className={clsx('mb-4 p-4 rounded border', isDarkMode ? 'border-gray-700' : 'border-gray-800')}>
                  <p className="mb-1 text-blue-300 text-center">Flashcard {idx + 1}</p>
                  <p className="text-center"><strong>Question:</strong> {card.question}</p>
                  <p className="text-center"><strong>Answer:</strong> {card.correctAnswer || card.answer}</p>
                  <p className={clsx('font-bold mt-1 text-center', card.isCorrect ? 'text-emerald-500' : 'text-red-500')}>
                    {card.isCorrect ? '✓ You got it right' : '✗ You got it wrong'}
                  </p>
                </div>
              ))}
              <div className="text-center mt-4">
                <button
                  onClick={() => setIsFinalFeedbackModalOpen(false)}
                  className={clsx('h-10 sm:h-12 px-4 py-2 rounded', isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')}
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
              className={clsx('p-6 rounded-lg w-11/12 max-w-2xl shadow-lg overflow-y-auto', isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800')}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl mb-4 text-center">Missed Questions</h2>
              <ul className="space-y-4">
                {savedMissedQuestions.map((card, idx) => (
                  <li key={idx} className="p-4 border rounded">
                    <p className="text-center"><strong>Question:</strong> {card.question}</p>
                    {card.questionType && <p className="text-center"><strong>Question Type:</strong> {card.questionType}</p>}
                    {card.lawType && <p className="text-center"><strong>Law Type:</strong> {card.lawType}</p>}
                    <p className="text-center"><strong>Answer:</strong> {card.correctAnswer || card.answer}</p>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsMissedQuestionsModalOpen(false)}
                  className={clsx('h-10 sm:h-12 px-4 py-2 rounded', isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800')}
                >
                  Close
                </button>
                <Link href="/ailawtools/insights" className="h-10 sm:h-12 px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow hover:opacity-90 transition-all duration-200 inline-block">
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-scroll flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={clsx('w-11/12 max-w-lg p-6 rounded shadow-lg overflow-y-auto', isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800')}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-center w-full">Flashcard Configuration</h2>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className={clsx('text-gray-500 hover:text-gray-700', isDarkMode ? 'hover:text-gray-300' : '')}
                >
                  ✕
                </button>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Year/Level:</label>
                <select
                  name="studyYear"
                  value={studyConfig.studyYear}
                  onChange={(e) => setStudyConfig({ ...studyConfig, studyYear: e.target.value })}
                  className={clsx('w-full p-3 border rounded', isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300')}
                >
                  {studyYearMapping.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Proficiency:</label>
                <select
                  name="proficiency"
                  value={studyConfig.proficiency}
                  onChange={(e) => setStudyConfig({ ...studyConfig, proficiency: e.target.value })}
                  className={clsx('w-full p-3 border rounded', isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300')}
                >
                  {proficiencyMapping.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Course/Subject:</label>
                <select
                  name="courseName"
                  value={studyConfig.courseName}
                  onChange={(e) => setStudyConfig({ ...studyConfig, courseName: e.target.value })}
                  className={clsx('w-full p-3 border rounded', isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300')}
                >
                  {courseNameMapping.map((course, idx) => (
                    <option key={idx} value={course}>{course}</option>
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
                  onChange={(e) => setStudyConfig({ ...studyConfig, questionLimit: e.target.value })}
                  className="w-full"
                />
                <p className="text-right">Selected: {studyConfig.questionLimit}</p>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Timer (in minutes):</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  name="timerMinutes"
                  value={studyConfig.timerMinutes}
                  onChange={(e) => setStudyConfig({ ...studyConfig, timerMinutes: e.target.value })}
                  className={clsx('w-full p-2 rounded', isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300')}
                  placeholder="Enter a time limit (e.g. 30)"
                />
                <p className="text-sm text-gray-400 mt-1">If &gt; 0, a countdown starts once flashcards are generated.</p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="resetTimerToggle" className="cursor-pointer font-semibold text-sm">Reset Timer On Each Question</label>
                <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="resetTimerEveryQuestion"
                    id="resetTimerToggle"
                    checked={studyConfig.resetTimerEveryQuestion}
                    onChange={(e) => setStudyConfig({ ...studyConfig, resetTimerEveryQuestion: e.target.checked })}
                    className="toggle-checkbox absolute h-0 w-0 opacity-0"
                  />
                  <label htmlFor="resetTimerToggle" className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="instantFeedbackToggle" className="cursor-pointer font-semibold text-sm">Instant Feedback (reveal answer immediately)</label>
                <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="instantFeedback"
                    id="instantFeedbackToggle"
                    checked={studyConfig.instantFeedback}
                    onChange={(e) => setStudyConfig({ ...studyConfig, instantFeedback: e.target.checked })}
                    className="toggle-checkbox absolute h-0 w-0 opacity-0"
                  />
                  <label htmlFor="instantFeedbackToggle" className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="includeExplanationsToggle" className="cursor-pointer font-semibold text-sm">Include Extended Explanations</label>
                <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="includeExplanations"
                    id="includeExplanationsToggle"
                    checked={studyConfig.includeExplanations}
                    onChange={(e) => setStudyConfig({ ...studyConfig, includeExplanations: e.target.checked })}
                    className="toggle-checkbox absolute h-0 w-0 opacity-0"
                  />
                  <label htmlFor="includeExplanationsToggle" className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="saveMissedQuestionsToggle" className="cursor-pointer font-semibold text-sm">Save Missed Questions for Review</label>
                <div className="relative inline-block w-14 h-8 select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="saveMissedQuestions"
                    id="saveMissedQuestionsToggle"
                    checked={studyConfig.saveMissedQuestions}
                    onChange={(e) => setStudyConfig({ ...studyConfig, saveMissedQuestions: e.target.checked })}
                    className="toggle-checkbox absolute h-0 w-0 opacity-0"
                  />
                  <label htmlFor="saveMissedQuestionsToggle" className="toggle-label block overflow-hidden h-8 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleGenerateFlashcards}
                  className="relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base shadow hover:opacity-90 transition-all duration-200 flex items-center justify-center gradientShadowHoverBlue"
                  aria-label="Start Flashcards"
                >
                  Start Flashcards
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className={clsx('h-10 sm:h-12 px-6 py-2 rounded transition-colors duration-200', isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400')}
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
