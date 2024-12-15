'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar'; // Ensure Sidebar component is correctly imported
import { FaBars, FaTimes, FaSave, FaSyncAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Firebase imports
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

// Authentication context
import { useAuth } from '@/context/AuthContext';

// Chart.js imports (optional)
import { Line, Pie, Bar as ChartBar } from 'react-chartjs-2';
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

export default function AIExamFlashCard() {
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;
  const router = useRouter();

  const [flashcards, setFlashcards] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [isFinalFeedbackModalOpen, setIsFinalFeedbackModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);

  const [answeredFlashcards, setAnsweredFlashcards] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);

  const [examConfig, setExamConfig] = useState({
    examType: 'LSAT',
    difficulty: '',
    lawType: 'General Law',
    flashcardLimit: 5,
    instantFeedback: false,
    selectedQuestionTypes: [],
  });

  const [answerMode, setAnswerMode] = useState('written');
  const [inputText, setInputText] = useState('');
  const [answerFeedback, setAnswerFeedback] = useState('');

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

  const [difficultyOptions, setDifficultyOptions] = useState(difficultyMapping['LSAT']);
  const [lawTypeOptions, setLawTypeOptions] = useState(lawTypeMapping['LSAT']);

  useEffect(() => {
    const newDifficultyOptions = difficultyMapping[examConfig.examType] || [];
    const newLawTypeOptions = lawTypeMapping[examConfig.examType] || ['General Law'];

    setDifficultyOptions(newDifficultyOptions);
    setLawTypeOptions(newLawTypeOptions);

    setExamConfig((prevConfig) => ({
      ...prevConfig,
      difficulty: newDifficultyOptions[0]?.value || '',
      lawType: newLawTypeOptions[0] || 'General Law',
      selectedQuestionTypes: [],
    }));
  }, [examConfig.examType]);

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamConfig((prevConfig) => ({
      ...prevConfig,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleQuestionTypeChange = (e, type) => {
    const { checked } = e.target;
    setExamConfig((prevConfig) => {
      let newSelectedQuestionTypes = [...prevConfig.selectedQuestionTypes];
      if (checked) {
        newSelectedQuestionTypes.push(type);
      } else {
        newSelectedQuestionTypes = newSelectedQuestionTypes.filter((t) => t !== type);
      }
      return {
        ...prevConfig,
        selectedQuestionTypes: newSelectedQuestionTypes,
      };
    });
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleGenerateFlashcards = async () => {
    setIsLoading(true);
    setFlashcards([]);
    setAnsweredFlashcards([]);
    setCurrentFlashcardIndex(0);
    setInputText('');
    setAnswerFeedback('');

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: examConfig }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const { flashcards: generatedFlashcards } = await response.json();
      setFlashcards(generatedFlashcards);
    } catch (error) {
      console.error('Error during flashcard generation:', error);
      alert('An error occurred during flashcard generation.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (flashcards.length > 0) {
      setAnsweredFlashcards([]);
      setCurrentFlashcardIndex(0);
      setInputText('');
      setAnswerFeedback('');
    }
  }, [flashcards]);

  const currentFlashcard = flashcards[currentFlashcardIndex];

  const handleSubmitAnswer = () => {
    if (!inputText.trim()) return;

    const userAnswer = inputText.trim();
    const correct = currentFlashcard.correctAnswer
      ? userAnswer.toLowerCase() === currentFlashcard.correctAnswer.toLowerCase()
      : userAnswer.toLowerCase() === currentFlashcard.answer.toLowerCase();

    const feedback = correct
      ? 'Correct! ✅'
      : `Incorrect ❌ The correct answer is: ${currentFlashcard.correctAnswer || currentFlashcard.answer}`;

    setAnsweredFlashcards((prev) => [
      ...prev,
      {
        question: currentFlashcard.question,
        userAnswer,
        correctAnswer: currentFlashcard.correctAnswer || currentFlashcard.answer,
        isCorrect: correct,
      },
    ]);

    setAnswerFeedback(feedback);

    if (examConfig.instantFeedback) {
      setIsResultModalOpen(true);
    } else {
      moveToNextFlashcard();
    }
  };

  const moveToNextFlashcard = () => {
    if (currentFlashcardIndex === flashcards.length - 1) {
      setIsFinalFeedbackModalOpen(true);
      return;
    }

    setCurrentFlashcardIndex((prevIndex) => prevIndex + 1);
    setInputText('');
    setAnswerFeedback('');
  };

  const closeResultModalAndContinue = () => {
    setIsResultModalOpen(false);
    moveToNextFlashcard();
  };

  const openConfigModal = () => {
    setIsConfigModalOpen(true);
  };

  const closeConfigModal = () => {
    setIsConfigModalOpen(false);
  };

  const openResultModal = () => {
    setIsResultModalOpen(true);
  };

  const closeResultModal = () => {
    setIsResultModalOpen(false);
  };

  const openLoadProgressModal = () => {
    fetchSavedProgresses();
    setIsLoadProgressModalOpen(true);
  };

  const closeLoadProgressModal = () => {
    setIsLoadProgressModalOpen(false);
  };

  const openFinalFeedbackModal = () => {
    setIsFinalFeedbackModalOpen(true);
  };

  const closeFinalFeedbackModal = () => {
    setIsFinalFeedbackModalOpen(false);
  };

  const handleSaveProgress = async () => {
    if (!currentUser) {
      alert('You need to be logged in to save your progress.');
      return;
    }

    try {
      const progressData = {
        userId: currentUser.uid,
        examConfig: {
          examType: examConfig.examType || 'LSAT',
          difficulty: examConfig.difficulty || 'Below 150',
          lawType: examConfig.lawType || 'General Law',
          flashcardLimit: examConfig.flashcardLimit || 5,
          instantFeedback:
            examConfig.instantFeedback !== undefined ? examConfig.instantFeedback : true,
          selectedQuestionTypes: examConfig.selectedQuestionTypes || [],
        },
        flashcards: flashcards || [],
        answeredFlashcards: answeredFlashcards || [],
        currentFlashcardIndex,
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, 'examProgress'), progressData);

      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('An error occurred while saving your progress.');
    }
  };

  const fetchSavedProgresses = async () => {
    if (!currentUser) {
      alert('You need to be logged in to load your progress.');
      return;
    }

    try {
      const q = query(collection(db, 'examProgress'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);

      const progresses = [];
      querySnapshot.forEach((doc) => {
        progresses.push({ id: doc.id, ...doc.data() });
      });

      setSavedProgresses(progresses);
    } catch (error) {
      console.error('Error fetching saved progresses:', error);
      alert('An error occurred while fetching saved progresses.');
    }
  };

  const handleLoadProgress = (progress) => {
    setExamConfig(progress.examConfig);
    setFlashcards(progress.flashcards);
    setAnsweredFlashcards(progress.answeredFlashcards || []);
    setCurrentFlashcardIndex(progress.currentFlashcardIndex || 0);
    closeLoadProgressModal();
  };

  const handleDeleteProgress = async (id) => {
    if (!currentUser) {
      alert('You need to be logged in to delete your progress.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'examProgress', id));
      fetchSavedProgresses();
    } catch (error) {
      console.error('Error deleting progress:', error);
      alert('An error occurred while deleting the progress.');
    }
  };

  const isProUser = userDataObj?.billing?.plan === 'Pro' || userDataObj?.billing?.plan === 'Developer';

  if (!currentUser) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className={`text-center p-6 rounded shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <p className={`mb-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Please{' '}
            <a href="/login" className={`underline ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
              log in
            </a>{' '}
            to use the AI Exam Flashcard tool.
          </p>
          <button
            onClick={() => router.push('/login')}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-900 text-white hover:bg-blue-700'}`}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded shadow-sm`}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/analysis"
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

      <main className={`flex-1 flex flex-col items-center p-6 overflow-auto ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <div className="w-full max-w-5xl flex items-center justify-between mb-6">
          <button
            onClick={toggleSidebar}
            className={`text-gray-600 ${isDarkMode ? 'text-white' : ''} hover:text-slate-500`}
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
          <button
            onClick={handleSaveProgress}
            className={`flex items-center px-4 py-2 rounded hover:bg-opacity-80 transition-colors duration-200 ${
              isDarkMode ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-950 text-white hover:bg-blue-800'
            }`}
            aria-label="Save Progress"
          >
            <FaSave className="mr-2" />
            Save Progress
          </button>
        </div>

        <div className="w-full max-w-5xl flex justify-end mb-4 space-x-4">
          <button
            onClick={openLoadProgressModal}
            className={`flex items-center px-4 py-2 rounded hover:bg-opacity-80 transition-colors duration-200 ${
              isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
            aria-label="Load Progress"
          >
            <FaSyncAlt className="mr-2" />
            Load Progress
          </button>
          <button
            onClick={openConfigModal}
            className={`flex items-center px-4 py-2 rounded hover:bg-opacity-80 transition-colors duration-200 ${
              isDarkMode ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-950 text-white hover:bg-blue-800'
            }`}
            aria-label="Configure Flashcards"
          >
            Configure
          </button>
        </div>

        {flashcards.length > 0 && (
          <div
            className={`w-full max-w-5xl mb-4 p-4 rounded shadow-md flex justify-between items-center ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Questions Answered: {answeredFlashcards.length} / {examConfig.flashcardLimit}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${
                (userDataObj?.billing?.plan === 'Pro' || userDataObj?.billing?.plan === 'Developer')
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {(userDataObj?.billing?.plan === 'Pro' || userDataObj?.billing?.plan === 'Developer') ? 'Pro User' : 'Base User'}
            </span>
          </div>
        )}

        {currentFlashcard && (
          <div
            className={`w-full max-w-5xl mb-6 p-6 rounded-lg shadow-md overflow-y-scroll ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              Flashcard {currentFlashcardIndex + 1}
            </h4>
            <h3 className="text-xl font-semibold mb-4">Question:</h3>
            <p className="mb-6">{currentFlashcard.question}</p>

            <div className="w-full max-w-5xl mb-4 flex items-center justify-center">
              <div className="relative flex bg-gray-200 rounded-full p-0.5">
                <motion.div
                  className="absolute top-0 left-0 w-1/2 h-full bg-blue-900 rounded-full"
                  initial={false}
                  animate={{ x: answerMode === 'written' ? 0 : '100%' }}
                  transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                />
                <button
                  onClick={() => setAnswerMode('written')}
                  className={`relative w-1/2 px-2 py-1 text-sm rounded-full focus:outline-none ${
                    answerMode === 'written' ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  Written
                </button>
                <button
                  onClick={() => setAnswerMode('multiple-choice')}
                  className={`relative w-1/2 px-2 py-1 text-sm rounded-full focus:outline-none ${
                    answerMode === 'multiple-choice' ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  Multiple Choice
                </button>
              </div>
            </div>

            {answerMode === 'written' ? (
              <textarea
                className={`w-full p-4 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 mb-4 ${
                  isDarkMode ? 'border-gray-600 bg-gray-600 text-white' : 'border-gray-300 bg-white text-gray-700'
                }`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your answer..."
                rows="6"
                disabled={isLoading}
              />
            ) : (
              <div className="flex flex-col space-y-2 mb-4">
                {(currentFlashcard.options || []).map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-2 rounded ${
                      isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="multipleChoiceAnswer"
                      value={option}
                      checked={inputText === option}
                      onChange={(e) => setInputText(e.target.value)}
                      className="form-radio h-4 w-4 text-blue-900 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isLoading}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
                {(!currentFlashcard.options || currentFlashcard.options.length === 0) && (
                  <p className="text-gray-500">No multiple-choice options provided for this flashcard.</p>
                )}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleSubmitAnswer}
                className={`flex-1 px-4 py-3 rounded font-semibold transition-colors duration-200 shadow-md ${
                  isLoading || !inputText.trim()
                    ? `bg-gray-300 text-gray-600 cursor-not-allowed`
                    : isDarkMode
                    ? 'bg-blue-700 hover:bg-blue-600 text-white'
                    : 'bg-blue-900 hover:bg-blue-950 text-white'
                }`}
                disabled={isLoading || !inputText.trim()}
                aria-label="Submit Answer"
              >
                {isLoading ? 'Submitting...' : 'Submit Answer'}
              </button>
              <button
                onClick={handleGenerateFlashcards}
                className={`flex items-center justify-center px-4 py-3 rounded font-semibold duration-200 ${
                  isDarkMode ? 'text-white hover:text-slate-500' : 'text-blue-950 hover:text-slate-200'
                }`}
                disabled={isLoading}
                aria-label="Regenerate Flashcards"
              >
                <motion.div whileHover={{ scale: 1.2, rotate: -360 }} transition={{ duration: 0.5 }}>
                  <FaSyncAlt size={24} />
                </motion.div>
              </button>
            </div>
          </div>
        )}

        {flashcards.length === 0 && !isLoading && (
          <div
            className={`w-full max-w-5xl p-6 rounded-lg shadow-md text-center ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
            }`}
          >
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Click <span className="font-semibold">Configure Exam Prep</span> to start.
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <strong>Important Note:</strong> This is not an official test prep for any law exam.
            </p>
          </div>
        )}
      </main>

      {/* Configuration Modal (Copied visually from ExamPrep's style) */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center ${isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'} z-[151] overflow-y-auto`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-8 rounded-lg w-11/12 max-w-md shadow-lg overflow-y-auto max-h-screen ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Configure Exam Prep
              </h2>
              <form>
                {/* Exam Type */}
                <div className="mb-4">
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Exam Type:</label>
                  <select
                    name="examType"
                    value={examConfig.examType}
                    onChange={handleConfigChange}
                    className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  >
                    <option value="LSAT">LSAT</option>
                    <option value="BAR">BAR</option>
                    <option value="MPRE">MPRE</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="mb-4">
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Score Range:</label>
                  <select
                    name="difficulty"
                    value={examConfig.difficulty}
                    onChange={handleConfigChange}
                    className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Law Type */}
                <div className="mb-4">
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Law Type:</label>
                  <select
                    name="lawType"
                    value={examConfig.lawType}
                    onChange={handleConfigChange}
                    className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  >
                    {lawTypeOptions.map((lawType, index) => (
                      <option key={index} value={lawType}>
                        {lawType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LSAT Question Types */}
                {examConfig.examType === 'LSAT' && (
                  <div className="mb-4">
                    {/* Logical Reasoning Question Types */}
                    <div className="mb-2">
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Logical Reasoning Types:</label>
                      {logicalReasoningQuestionTypes.map((type) => (
                        <div key={type} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={`lr-${type}`}
                            name={type}
                            checked={examConfig.selectedQuestionTypes.includes(type)}
                            onChange={(e) => handleQuestionTypeChange(e, type)}
                            className={`h-5 w-5 focus:ring-blue-500 border-gray-300 rounded ${
                              isDarkMode ? 'bg-gray-600 text-white' : ''
                            }`}
                          />
                          <label htmlFor={`lr-${type}`} className={`ml-3 block ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Reading Comprehension Question Types */}
                    <div className="mb-2">
                      <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reading Comprehension Types:</label>
                      {readingComprehensionQuestionTypes.map((type) => (
                        <div key={type} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={`rc-${type}`}
                            name={type}
                            checked={examConfig.selectedQuestionTypes.includes(type)}
                            onChange={(e) => handleQuestionTypeChange(e, type)}
                            className={`h-5 w-5 focus:ring-blue-500 border-gray-300 rounded ${
                              isDarkMode ? 'bg-gray-600 text-white' : ''
                            }`}
                          />
                          <label htmlFor={`rc-${type}`} className={`ml-3 block ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instant Feedback Checkbox */}
                <div className="mb-6 flex items-center">
                  <input
                    type="checkbox"
                    id="instantFeedback"
                    name="instantFeedback"
                    checked={examConfig.instantFeedback}
                    onChange={handleConfigChange}
                    className={`h-5 w-5 focus:ring-blue-500 border-gray-300 rounded ${
                      isDarkMode ? 'bg-gray-600 text-white' : ''
                    }`}
                  />
                  <label htmlFor="instantFeedback" className={`ml-3 block ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    Enable Instant Feedback
                  </label>
                </div>

                {/* Question Limit Slider */}
                <div className="mb-6">
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Number of Questions in a Row:
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={examConfig.questionLimit}
                      onChange={(e) =>
                        setExamConfig((prevConfig) => ({
                          ...prevConfig,
                          questionLimit: parseInt(e.target.value, 10),
                        }))
                      }
                      className={`w-full h-2 ${isDarkMode ? 'bg-blue-700' : 'bg-blue-200'} rounded-lg appearance-none cursor-pointer`}
                      id="questionLimit"
                    />
                    <span className={`ml-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      {examConfig.questionLimit}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      closeConfigModal();
                      handleGetQuestion();
                    }}
                    className={`group relative h-12 w-56 overflow-hidden rounded ${
                      isDarkMode ? 'bg-blue-700' : 'bg-gradient-to-r from-blue-950 to-slate-700'
                    } text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56 hover:text-slate-500`}
                    aria-label="Start Exam Prep"
                  >
                    Start Exam Prep
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
                    className={`px-6 py-3 rounded ${
                      isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    } transition-colors duration-200`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flashcard Result Modal (Instant Feedback) */}
      <AnimatePresence>
        {isResultModalOpen && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center ${isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'} z-50`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-8 rounded-lg w-11/12 max-w-md shadow-lg overflow-y-auto ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Answer Feedback</h2>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{answerFeedback}</p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    closeResultModal();
                    moveToNextFlashcard();
                  }}
                  className={`px-6 py-3 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white hover:text-slate-500' : 'bg-blue-900 hover:bg-blue-700 text-white hover:text-slate-500'} transition-colors duration-200`}
                  aria-label="Close and Continue"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load Progress Modal */}
      <AnimatePresence>
        {isLoadProgressModalOpen && (
          <motion.div
          className={`fixed inset-0 flex items-center justify-center ${isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'} z-[151]`}
           initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
             className={`p-8 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-screen ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
             initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Load Saved Progress</h2>
              {savedProgresses.length === 0 ? (
                <p className={`text-gray-700 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No saved progresses found.</p>
              ) : (
                <ul className="space-y-4">
                  {savedProgresses.map((progress) => (
                    <li key={progress.id} className={`p-4 border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} rounded`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
                            Exam Type: {progress.examConfig.examType}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Law Type: {progress.examConfig.lawType}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Difficulty: {progress.examConfig.difficulty}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Number of Flashcards: {progress.examConfig.flashcardLimit}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Current Flashcard: {progress.currentFlashcardIndex + 1}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Saved on: {new Date(progress.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleLoadProgress(progress)}
                            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white hover:text-slate-500' : 'bg-blue-900 hover:bg-blue-700 text-white hover:text-slate-500'} transition-colors duration-200`}
                            aria-label="Load Progress"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(progress.id)}
                            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white hover:text-slate-500' : 'bg-red-600 hover:bg-red-700 text-white hover:text-slate-500'} transition-colors duration-200`}
                            aria-label="Delete Progress"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={closeLoadProgressModal}
                  className={`px-6 py-3 rounded ${
                    isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  } transition-colors duration-200`}
                  aria-label="Close Load Progress Modal"
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
            className={`fixed inset-0 flex items-center justify-center ${isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'} z-50 overflow-y-auto`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-8 rounded-lg w-11/12 max-w-3xl shadow-lg max-h-[80vh] overflow-y-auto ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Session Feedback
              </h2>
              <ul className="space-y-4">
                {answeredFlashcards.map((card, index) => (
                  <li key={index} className={`p-4 border rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <p className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-900'} mb-2`}>
                      Flashcard {index + 1}:
                    </p>
                    <p className="mb-2">{card.question}</p>
                    <p className="mb-1">
                      <span className="font-semibold">Your Answer:</span> {card.userAnswer || 'No answer provided.'}
                    </p>
                    <p className="mb-1">
                      <span className="font-semibold">Correct Answer:</span> {card.correctAnswer || 'No answer provided.'}
                    </p>
                    <p className={`font-semibold ${card.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                      {card.isCorrect ? 'Correct ✅' : 'Incorrect ❌'}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsFinalFeedbackModalOpen(false)}
                  className={`px-6 py-3 rounded ${
                    isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white hover:text-slate-500' : 'bg-blue-950 hover:bg-blue-800 text-white hover:text-slate-500'
                  } transition-colors duration-200`}
                  aria-label="Close Final Feedback Modal"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
