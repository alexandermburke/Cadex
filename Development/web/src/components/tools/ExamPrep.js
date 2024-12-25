// ExamPrep.js
'use client';

import React, { useState, useEffect } from 'react';
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
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

import { FaBars, FaTimes, FaSave, FaSyncAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExamPrep() {
  const { currentUser, userDataObj } = useAuth();
  const router = useRouter();

  // Only one declaration of inputText:
  const [inputText, setInputText] = useState('');

  const [questionText, setQuestionText] = useState('');
  const [questionStem, setQuestionStem] = useState('');
  const [options, setOptions] = useState([]);
  const [answerResult, setAnswerResult] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [isFinalFeedbackModalOpen, setIsFinalFeedbackModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);

  const isDarkMode = userDataObj?.darkMode || false;

  const [currentQuestionCount, setCurrentQuestionCount] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [isExamStarted, setIsExamStarted] = useState(false);

  const [examConfig, setExamConfig] = useState({
    examType: 'LSAT',
    difficulty: '',
    lawType: 'General Law',
    questionLimit: 5,
    instantFeedback: false,
    selectedQuestionTypes: [],
  });

  // 'written' or 'multiple-choice'
  const [answerMode, setAnswerMode] = useState('written');

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

  // Update difficulty & law options if examType changes
  useEffect(() => {
    const newDiffOptions = difficultyMapping[examConfig.examType] || [];
    const newLawTypeOptions = lawTypeMapping[examConfig.examType] || ['General Law'];

    setDifficultyOptions(newDiffOptions);
    setLawTypeOptions(newLawTypeOptions);

    setExamConfig((prevConfig) => ({
      ...prevConfig,
      difficulty: newDiffOptions[0]?.value || '',
      lawType: newLawTypeOptions[0] || 'General Law',
      selectedQuestionTypes: [],
    }));
  }, [examConfig.examType]);

  // Helper to toggle sidebar
  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Helper to parse a question string into stem + options
  const parseQuestion = (text) => {
    const lines = text.split('\n');
    let stemLines = [];
    let choiceLines = [];
    let inOptionSection = false;

    for (let line of lines) {
      const trimmedLine = line.trim();
      // If line starts with 'A) ...', 'B) ...', etc., switch to option section
      if (/^\(?[A-E]\)?[).:]?\s/.test(trimmedLine)) {
        inOptionSection = true;
        choiceLines.push(trimmedLine);
      } else if (inOptionSection && trimmedLine) {
        // continuing last option
        if (choiceLines.length > 0) {
          choiceLines[choiceLines.length - 1] += ' ' + trimmedLine;
        }
      } else {
        stemLines.push(trimmedLine);
      }
    }
    const stem = stemLines.join(' ');
    return { stem, choices: choiceLines };
  };

  // Simple helper to identify letter
  const getOptionLetter = (option) => {
    const match = option.match(/^\(?([A-E])\)?[).:]/i);
    return match ? match[1].toUpperCase() : null;
  };

  const handleGetQuestion = async () => {
    setIsLoading(true);
    setQuestionText('');
    setQuestionStem('');
    setOptions([]);
    setAnswerResult('');
    setInputText(''); // Clear input

    try {
      const response = await fetch('/api/examprep/get-exam-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to get exam question');
      }

      const { question } = await response.json();
      const { stem, choices } = parseQuestion(question);

      setQuestionStem(stem);
      setOptions(choices);
      setQuestionText(question);
      setIsExamStarted(true);
    } catch (error) {
      console.error('Error fetching exam question:', error);
      setQuestionText('An error occurred while fetching the exam question.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setAnswerResult('');

    try {
      const response = await fetch('/api/submit-exam-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          answer: inputText,
          examType: examConfig.examType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const { feedback, correct } = await response.json();
      const feedbackText = feedback !== undefined ? feedback : 'No feedback provided.';
      const isCorrect = typeof correct === 'boolean' ? correct : false;

      setAnswerResult(feedbackText);

      setAnsweredQuestions((prev) => [
        ...prev,
        {
          question: questionText || 'No question text provided.',
          answer: inputText || 'No answer provided.',
          feedback: feedbackText,
          correct: isCorrect,
        },
      ]);

      setCurrentQuestionCount((prevCount) => prevCount + 1);

      if (examConfig.instantFeedback) {
        openResultModal();
      } else {
        // automatically fetch next question after a short delay
        setTimeout(() => {
          handleGetQuestion();
        }, 500);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setAnswerResult('An error occurred while submitting your answer.');
      openResultModal();
    } finally {
      setIsLoading(false);
    }
  };

  // If user hits questionLimit
  useEffect(() => {
    if (currentQuestionCount >= examConfig.questionLimit && questionText !== '') {
      setCurrentQuestionCount(0);
      openFinalFeedbackModal();
    }
  }, [currentQuestionCount, examConfig.questionLimit, questionText]);

  // Modals
  const openConfigModal = () => setIsConfigModalOpen(true);
  const closeConfigModal = () => setIsConfigModalOpen(false);

  const openResultModal = () => setIsResultModalOpen(true);
  const closeResultModal = () => setIsResultModalOpen(false);

  const openLoadProgressModal = () => {
    fetchSavedProgresses();
    setIsLoadProgressModalOpen(true);
  };
  const closeLoadProgressModal = () => setIsLoadProgressModalOpen(false);

  const openFinalFeedbackModal = () => setIsFinalFeedbackModalOpen(true);
  const closeFinalFeedbackModal = () => setIsFinalFeedbackModalOpen(false);

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
      let updated = [...prevConfig.selectedQuestionTypes];
      if (checked) updated.push(type);
      else updated = updated.filter((t) => t !== type);
      return { ...prevConfig, selectedQuestionTypes: updated };
    });
  };

  const handleStartExamPrep = () => {
    closeConfigModal();
    handleGetQuestion();
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
          questionLimit: examConfig.questionLimit || 5,
          instantFeedback: examConfig.instantFeedback ?? true,
          selectedQuestionTypes: examConfig.selectedQuestionTypes || [],
        },
        questionText: questionText || '',
        inputText: inputText || '',
        answerResult: answerResult || '',
        currentQuestionCount: currentQuestionCount || 0,
        answeredQuestions: answeredQuestions.map((q) => ({
          question: q.question || 'No question text provided.',
          answer: q.answer || 'No answer provided.',
          feedback: q.feedback || 'No feedback provided.',
          correct: typeof q.correct === 'boolean' ? q.correct : false,
        })),
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

      const loaded = [];
      querySnapshot.forEach((doc) => {
        loaded.push({ id: doc.id, ...doc.data() });
      });

      setSavedProgresses(loaded);
    } catch (error) {
      console.error('Error fetching saved progresses:', error);
      alert('An error occurred while fetching saved progresses.');
    }
  };

  const handleLoadProgress = (progress) => {
    setExamConfig(progress.examConfig);
    setQuestionText(progress.questionText);
    setInputText(progress.inputText);
    setAnswerResult(progress.answerResult);
    setCurrentQuestionCount(progress.currentQuestionCount);
    setAnsweredQuestions(progress.answeredQuestions || []);
    setIsExamStarted(true);

    // Re-parse question to restore stem+options
    const { stem, choices } = parseQuestion(progress.questionText);
    setQuestionStem(stem);
    setOptions(choices);

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

  if (!currentUser) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}
      >
        <div className={`text-center p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded shadow-md`}>
          <p className={`mb-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Please{' '}
            <a
              href="/login"
              className={`underline ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}
            >
              log in
            </a>{' '}
            to use the Exam Prep tool.
          </p>
          <button
            onClick={() => router.push('/login')}
            className={`px-4 py-2 rounded ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-blue-900 text-white hover:bg-blue-700'
            }`}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const isProUser =
    userDataObj?.billing?.plan === 'Pro' || userDataObj?.billing?.plan === 'Developer';

  return (
    <div
      className={`flex h-screen ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      } rounded shadow-md`}
    >
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/examprep"
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebarVisibility}
            />
            <motion.div
              className={`fixed inset-0 ${
                isDarkMode ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-30'
              } z-40 md:hidden`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebarVisibility}
            />
          </>
        )}
      </AnimatePresence>

      <main
        className={`flex-1 flex flex-col items-center p-6 overflow-auto ${
          isDarkMode ? 'text-white' : 'text-black'
        }`}
      >
        {/* Header */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-6">
          <button
            onClick={toggleSidebarVisibility}
            className={`text-gray-600 ${
              isDarkMode ? 'text-white' : 'text-gray-600'
            } hover:text-slate-500`}
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
            onClick={() => {
              if (isProUser) {
                router.push('/ailawtools/examprep/full-mode');
              } else {
                alert(
                  'Professional Mode is only available for Pro users. Upgrade to access this feature.'
                );
              }
            }}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              isProUser
                ? `${
                    isDarkMode
                      ? 'goldBackground goldShadow text-white hover:opacity-80'
                      : 'goldBackground goldShadow text-white hover:opacity-80'
                  } text-white`
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            disabled={!isProUser}
            aria-label="Professional Mode"
          >
            Pro Mode
          </button>
        </div>

        {/* Configuration and Control Buttons */}
        <div className="w-full max-w-5xl flex flex-row flex-nowrap justify-end mb-4 gap-2 sm:gap-4">
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
            aria-label="Configure Exam Prep"
          >
            Configure
          </button>
        </div>

        {/* Question Counter */}
        {isExamStarted && (
          <div
            className={`w-full max-w-5xl mb-4 p-4 ${
              isDarkMode ? 'bg-gray-700' : 'bg-white'
            } rounded-lg shadow-md flex justify-between items-center`}
          >
            <span className={`${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
              Questions Answered: {currentQuestionCount} / {examConfig.questionLimit}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${
                isProUser ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isProUser ? 'Pro User' : 'Base User'}
            </span>
          </div>
        )}

        {/* Question + Options */}
        {questionStem && (
          <div
            className={`w-full max-w-5xl mb-6 p-6 ${
              isDarkMode ? 'bg-gray-700' : 'bg-white'
            } rounded-lg shadow-md overflow-y-scroll`}
          >
            <h3
              className={`text-2xl font-semibold mb-2 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-900'
              }`}
            >
              Exam Question
            </h3>
            <h3
              className={`text-sm font-medium mb-6 ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}
            >
              LExAPI Version: 0.3.4
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {questionStem}
            </p>
            {options.length > 0 && (
              <ul className="list-none">
                {options.map((option, index) => (
                  <li
                    key={index}
                    className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Answer Mode Toggle */}
        {(questionStem || questionText) && (
          <div className="w-full max-w-5xl mb-2 flex items-center justify-center">
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
        )}

        {/* Answer Input */}
        {(questionStem || questionText) && (
          <div className="w-full max-w-5xl mb-6">
            {answerMode === 'written' ? (
              <textarea
                className={`w-full p-4 border ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-gray-800'
                } rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your answer..."
                rows="6"
                disabled={isLoading}
              />
            ) : (
              <div className="flex flex-col space-y-2">
                {options.map((option, index) => {
                  const optionLetter = getOptionLetter(option);
                  if (!optionLetter) return null;
                  return (
                    <label
                      key={index}
                      className={`flex items-center ${
                        isDarkMode ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="multipleChoiceAnswer"
                        value={optionLetter}
                        checked={inputText === optionLetter}
                        onChange={(e) => setInputText(e.target.value)}
                        className={`form-radio h-4 w-4 ${
                          isDarkMode ? 'text-blue-900' : 'text-blue-900'
                        } focus:ring-blue-500 border-gray-300 rounded`}
                        disabled={isLoading}
                      />
                      <span className="ml-2">{option}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {(questionStem || questionText) && (
          <div className="w-full max-w-5xl flex space-x-4">
            <button
              onClick={handleSubmitAnswer}
              className={`flex-1 px-4 py-3 rounded font-semibold transition-colors duration-200 shadow-md ${
                isLoading || !inputText.trim()
                  ? `${
                      isDarkMode
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`
                  : `${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-900 hover:bg-blue-950 text-white'
                    }`
              }`}
              disabled={isLoading || !inputText.trim()}
              aria-label="Submit Answer"
            >
              {isLoading ? 'Submitting...' : 'Submit Answer'}
            </button>
            <button
              onClick={handleSaveProgress}
              className={`flex items-center justify-center px-4 py-3 rounded ${
                isDarkMode
                  ? 'bg-transparent text-white hover:text-slate-500'
                  : 'bg-transparent text-blue-950 hover:text-slate-500'
              } transition-colors duration-200`}
              disabled={!currentUser}
              aria-label="Save Progress"
            >
              <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.5 }}>
                <FaSave size={24} />
              </motion.div>
            </button>
            <button
              onClick={handleGetQuestion}
              className={`flex items-center justify-center px-4 py-3 rounded ${
                isDarkMode
                  ? 'bg-transparent text-white hover:text-slate-500'
                  : 'bg-transparent text-blue-950 hover:text-slate-500'
              } transition-colors duration-200`}
              disabled={isLoading}
              aria-label="Generate New Question"
            >
              <motion.div whileHover={{ scale: 1.2, rotate: -360 }} transition={{ duration: 0.5 }}>
                <FaSyncAlt size={24} />
              </motion.div>
            </button>
          </div>
        )}

        {/* Placeholder if no question */}
        {!questionStem && !questionText && (
          <div
            className={`w-full max-w-5xl p-6 rounded-lg shadow-md text-center ${
              isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-black'
            }`}
          >
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Click <span className="font-semibold">Configure Exam Prep</span> to start.
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <strong>Important Note:</strong> This is not an official test prep for any law exam
              (LSAT, Bar, etc.) and is intended solely to give users an idea of the types of
              questions on those exams.
            </p>
          </div>
        )}

        {/* Configuration Modal */}
        {isConfigModalOpen && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center ${
              isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'
            } z-[151]`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-8 rounded-lg w-11/12 max-w-md shadow-lg overflow-y-auto max-h-screen ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className={`text-2xl font-semibold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                Configure Exam Prep
              </h2>
              <form>
                {/* Exam Type */}
                <div className="mb-4">
                  <label
                    className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Exam Type:
                  </label>
                  <select
                    name="examType"
                    value={examConfig.examType}
                    onChange={handleConfigChange}
                    className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  >
                    <option value="LSAT">LSAT</option>
                    <option value="BAR">BAR</option>
                    <option value="MPRE">MPRE</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="mb-4">
                  <label
                    className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Score Range:
                  </label>
                  <select
                    name="difficulty"
                    value={examConfig.difficulty}
                    onChange={handleConfigChange}
                    className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
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
                  <label
                    className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Law Type:
                  </label>
                  <select
                    name="lawType"
                    value={examConfig.lawType}
                    onChange={handleConfigChange}
                    className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  >
                    {lawTypeOptions.map((lawType, index) => (
                      <option key={index} value={lawType}>
                        {lawType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LSAT only question types */}
                {examConfig.examType === 'LSAT' && (
                  <div className="mb-4">
                    <div className="mb-2">
                      <label
                        className={`block mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Logical Reasoning Types:
                      </label>
                      {logicalReasoningQuestionTypes.map((type) => (
                        <div key={type} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={`lr-${type}`}
                            name={type}
                            checked={examConfig.selectedQuestionTypes.includes(type)}
                            onChange={(e) => handleQuestionTypeChange(e, type)}
                            className={`h-5 w-5 ${
                              isDarkMode
                                ? 'text-blue-900 bg-gray-600 border-gray-500'
                                : 'text-blue-900 bg-white border-gray-300'
                            } focus:ring-blue-500 rounded`}
                          />
                          <label
                            htmlFor={`lr-${type}`}
                            className={`ml-3 block ${
                              isDarkMode ? 'text-white' : 'text-gray-700'
                            }`}
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="mb-2">
                      <label
                        className={`block mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Reading Comprehension Types:
                      </label>
                      {readingComprehensionQuestionTypes.map((type) => (
                        <div key={type} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={`rc-${type}`}
                            name={type}
                            checked={examConfig.selectedQuestionTypes.includes(type)}
                            onChange={(e) => handleQuestionTypeChange(e, type)}
                            className={`h-5 w-5 ${
                              isDarkMode
                                ? 'text-blue-900 bg-gray-600 border-gray-500'
                                : 'text-blue-900 bg-white border-gray-300'
                            } focus:ring-blue-500 rounded`}
                          />
                          <label
                            htmlFor={`rc-${type}`}
                            className={`ml-3 block ${
                              isDarkMode ? 'text-white' : 'text-gray-700'
                            }`}
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instant Feedback */}
                <div className="mb-6 flex items-center">
                  <input
                    type="checkbox"
                    id="instantFeedback"
                    name="instantFeedback"
                    checked={examConfig.instantFeedback}
                    onChange={handleConfigChange}
                    className={`h-5 w-5 ${
                      isDarkMode
                        ? 'text-blue-900 bg-gray-600 border-gray-500'
                        : 'text-blue-900 bg-white border-gray-300'
                    } focus:ring-blue-500 rounded`}
                  />
                  <label
                    htmlFor="instantFeedback"
                    className={`ml-3 block ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Enable Instant Feedback
                  </label>
                </div>

                {/* Question Limit Slider */}
                <div className="mb-6">
                  <label
                    className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
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
                      className={`w-full h-2 ${
                        isDarkMode ? 'bg-blue-700' : 'bg-blue-200'
                      } rounded-lg appearance-none cursor-pointer`}
                      id="questionLimit"
                    />
                    <span className={`ml-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      {examConfig.questionLimit}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                <button
                                        type="button"
                                        onClick={handleStartExamPrep}
                                        className="relative h-12 w-full sm:w-56 overflow-hidden rounded bg-blue-950 text-white shadow-lg transition-colors duration-200 before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
                                        aria-label="Start Tutoring Session"
                                      >
                                        Start Tutoring
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
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Result Modal */}
        {isResultModalOpen && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center ${
              isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'
            } z-50`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-8 rounded-lg w-11/12 max-w-md shadow-lg overflow-y-auto ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className={`text-2xl font-semibold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                Answer Feedback
              </h2>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                {answerResult}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeResultModal}
                  className={`h-10 sm:h-12 px-4 py-2 rounded ${
                    isDarkMode
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } transition-colors duration-200 text-sm sm:text-base`}
                  aria-label="Close Feedback Modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeResultModal();
                    handleGetQuestion();
                  }}
                  className={`h-10 sm:h-12 px-4 py-2 rounded ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-900 hover:bg-blue-950 text-white'
                  } transition-colors duration-200 text-sm sm:text-base`}
                  disabled={isLoading}
                  aria-label="Next Question"
                >
                  {isLoading ? 'Loading...' : 'Next Question'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Final Feedback Modal */}
        {isFinalFeedbackModalOpen && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center ${
              isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'
            } z-50 overflow-y-auto`}
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
              <h2
                className={`text-2xl font-semibold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                Session Feedback
              </h2>
              <ul className="space-y-4">
                {answeredQuestions.map((item, index) => (
                  <li
                    key={index}
                    className={`p-4 border ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    } rounded`}
                  >
                    <p
                      className={`font-semibold mb-2 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-900'
                      }`}
                    >
                      Question {index + 1}:
                    </p>
                    <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.question}
                    </p>
                    <p className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="font-semibold">Your Answer:</span> {item.answer}
                    </p>
                    <p className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="font-semibold">Feedback:</span> {item.feedback}
                    </p>
                    <p
                      className={`font-semibold ${
                        item.correct ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {item.correct ? 'Correct ✅' : 'Incorrect ❌'}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={closeFinalFeedbackModal}
                  className={`h-10 sm:h-12 px-6 py-2 rounded ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-900 hover:bg-blue-700 text-white'
                  } transition-colors duration-200 text-sm sm:text-base`}
                  aria-label="Close Final Feedback Modal"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Load Progress Modal */}
        {isLoadProgressModalOpen && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center ${
              isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'
            } z-[151]`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-8 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-screen ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className={`text-2xl font-semibold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                Load Saved Progress
              </h2>
              {savedProgresses.length === 0 ? (
                <p
                  className={`text-gray-700 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  No saved progresses found.
                </p>
              ) : (
                <ul className="space-y-4">
                  {savedProgresses.map((progress) => (
                    <li
                      key={progress.id}
                      className={`p-4 border ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-200'
                      } rounded`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p
                            className={`font-semibold ${
                              isDarkMode ? 'text-blue-400' : 'text-blue-900'
                            }`}
                          >
                            Exam Type: {progress.examConfig.examType}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Law Type: {progress.examConfig.lawType}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Difficulty: {progress.examConfig.difficulty}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Number of Questions Set: {progress.examConfig.questionLimit}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Current Question: {progress.currentQuestionCount}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Saved on: {new Date(progress.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleLoadProgress(progress)}
                            className={`h-10 w-20 sm:w-24 overflow-hidden rounded ${
                              isDarkMode
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-900 hover:bg-blue-700 text-white'
                            } transition-colors duration-200 text-sm sm:text-base`}
                            aria-label="Load Progress"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(progress.id)}
                            className={`h-10 w-20 sm:w-24 overflow-hidden rounded ${
                              isDarkMode
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            } transition-colors duration-200 text-sm sm:text-base`}
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
                  className={`h-10 sm:h-12 px-6 py-2 rounded ${
                    isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  } transition-colors duration-200 text-sm sm:text-base`}
                  aria-label="Close Load Progress Modal"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
