'use client';
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaSyncAlt, FaSave, FaChevronDown } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import { useAuth } from '@/context/AuthContext';
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

export default function ExamPrep() {
  const { currentUser, userDataObj } = useAuth();
  const router = useRouter();
  const isDarkMode = userDataObj?.darkMode || false;

  // -----------------------------
  // Exam question and answer states
  // -----------------------------
  const [inputText, setInputText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionStem, setQuestionStem] = useState('');
  const [options, setOptions] = useState([]);
  const [answerResult, setAnswerResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isFinalFeedbackModalOpen, setIsFinalFeedbackModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);
  const [currentQuestionCount, setCurrentQuestionCount] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [isExamStarted, setIsExamStarted] = useState(false);

  // -----------------------------
  // Score and category tracking
  // -----------------------------
  const initialCategories = {
    Contracts: { correct: 0, total: 0 },
    Torts: { correct: 0, total: 0 },
    CriminalLaw: { correct: 0, total: 0 },
    Property: { correct: 0, total: 0 },
    Evidence: { correct: 0, total: 0 },
    ConstitutionalLaw: { correct: 0, total: 0 },
    CivilProcedure: { correct: 0, total: 0 },
    BusinessAssociations: { correct: 0, total: 0 },
  };
  const [categories, setCategories] = useState(initialCategories);
  const [overallCorrect, setOverallCorrect] = useState(0);
  const [overallTotal, setOverallTotal] = useState(0);

  // -----------------------------
  // Exam configuration state and options
  // -----------------------------
  const [examConfig, setExamConfig] = useState({
    examType: 'Practice Exam',
    lawSubject: 'Contracts',
    difficulty: 'Basic',
    questionLimit: 5,
    instantFeedback: false,
    selectedQuestionTypes: [],
    timeLimit: 0, // in minutes; 0 means no time limit
    includeCurveBalls: false,
    allowMultipleChoice: true,
    preferEssayStyle: false,
    extraInstructions: '',
  });
  const [answerMode, setAnswerMode] = useState('written');
  const examTypeOptions = ['Practice Exam', 'Bar Practice', 'Midterm Prep', 'Final Prep'];
  const lawSubjectOptions = [
    'Contracts',
    'Torts',
    'CriminalLaw',
    'Property',
    'Evidence',
    'ConstitutionalLaw',
    'CivilProcedure',
    'BusinessAssociations',
  ];
  const difficultyOptions = ['Basic', 'Intermediate', 'Advanced', 'Expert'];
  const questionTypeOptions = [
    'Issue Spotting',
    'Rule Identification',
    'Application/Analysis',
    'Multiple-Choice Format',
    'Short-Answer/Essay',
  ];

  // -----------------------------
  // Sidebar toggle (unused in new design since sidebar is always visible)
  // -----------------------------
  const toggleSidebar = () => {
    // Sidebar toggle function exists if needed.
    // (In this version, the sidebar is always visible.)
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
  };

  // -----------------------------
  // Helper function: Parse exam question into stem and choices.
  // -----------------------------
  const parseQuestion = (text) => {
    const lines = text.split('\n');
    let stemLines = [];
    let choiceLines = [];
    let inOptionSection = false;
    for (let line of lines) {
      const trimmed = line.trim();
      if (/^\(?[A-E]\)?[).:]?\s/.test(trimmed)) {
        inOptionSection = true;
        choiceLines.push(trimmed);
      } else if (inOptionSection && trimmed) {
        if (choiceLines.length > 0) {
          choiceLines[choiceLines.length - 1] += ' ' + trimmed;
        }
      } else {
        stemLines.push(trimmed);
      }
    }
    return {
      stem: stemLines.join(' '),
      choices: choiceLines,
    };
  };

  const getOptionLetter = (option) => {
    const match = option.match(/^\(?([A-E])\)?[).:]/i);
    return match ? match[1].toUpperCase() : null;
  };

  // -----------------------------
  // Fetch a new exam question
  // -----------------------------
  const handleGetQuestion = async () => {
    setIsLoading(true);
    setQuestionText('');
    setQuestionStem('');
    setOptions([]);
    setAnswerResult('');
    setInputText('');
    try {
      const response = await fetch('/api/examprep/get-exam-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examConfig),
      });
      if (!response.ok) throw new Error('Failed to get exam question');
      const data = await response.json();
      const { question } = data;
      const { stem, choices } = parseQuestion(question);
      setQuestionStem(stem);
      setOptions(choices);
      setQuestionText(question);
      setIsExamStarted(true);
    } catch (err) {
      console.error('Error fetching exam question:', err);
      setQuestionText('An error occurred while fetching the question.');
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------
  // Submit exam answer for evaluation
  // -----------------------------
  const handleSubmitAnswer = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setAnswerResult('');
    try {
      const response = await fetch('/api/examprep/submit-exam-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          answer: inputText,
          examType: examConfig.examType,
          lawType: examConfig.lawSubject,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit answer');
      const { feedback, correct } = await response.json();
      setAnswerResult(feedback || 'No feedback provided.');
      setAnsweredQuestions((prev) => [
        ...prev,
        {
          question: questionText || 'No question text provided.',
          answer: inputText || 'No answer provided.',
          feedback,
          correct: correct || false,
        },
      ]);
      setCurrentQuestionCount((c) => c + 1);
      const subj = examConfig.lawSubject || 'Contracts';
      setCategories((prev) => {
        const newCat = { ...prev[subj] };
        newCat.total += 1;
        if (correct) newCat.correct += 1;
        return { ...prev, [subj]: newCat };
      });
      setOverallTotal((prev) => prev + 1);
      if (correct) setOverallCorrect((prev) => prev + 1);
      if (examConfig.instantFeedback) {
        setIsResultModalOpen(true);
      } else {
        setTimeout(() => {
          handleGetQuestion();
        }, 500);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setAnswerResult('Error evaluating your answer.');
      setIsResultModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentQuestionCount >= Number(examConfig.questionLimit) && questionText !== '') {
      setCurrentQuestionCount(0);
      setIsFinalFeedbackModalOpen(true);
    }
  }, [currentQuestionCount, examConfig.questionLimit, questionText]);

  // -----------------------------
  // Save exam progress to Firestore
  // -----------------------------
  const handleSaveProgress = async () => {
    if (!currentUser) {
      alert('You must be logged in to save progress.');
      return;
    }
    try {
      const docData = {
        userId: currentUser.uid,
        examConfig: { ...examConfig },
        questionText: questionText || '',
        inputText: inputText || '',
        answerResult: answerResult || '',
        currentQuestionCount,
        answeredQuestions: answeredQuestions.map((q) => ({ ...q })),
        timestamp: new Date().toISOString(),
        categories: { ...categories },
        overallCorrect,
        overallTotal,
      };
      await addDoc(collection(db, 'examProgress'), docData);
      alert('Progress saved. You can view it in Insights or reload it later.');
    } catch (err) {
      console.error('Error saving progress:', err);
      alert('Error saving progress.');
    }
  };

  // -----------------------------
  // Load saved progress from Firestore
  // -----------------------------
  const fetchSavedProgresses = async () => {
    if (!currentUser) {
      alert('Log in to load progress');
      return;
    }
    try {
      const q = query(collection(db, 'examProgress'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const loaded = [];
      snap.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSavedProgresses(loaded);
    } catch (err) {
      console.error('Error loading progress:', err);
      alert('Error loading progress.');
    }
  };

  const handleLoadProgress = (progress) => {
    setExamConfig(progress.examConfig);
    setQuestionText(progress.questionText);
    setInputText(progress.inputText);
    setAnswerResult(progress.answerResult);
    setCurrentQuestionCount(progress.currentQuestionCount);
    setAnsweredQuestions(progress.answeredQuestions || []);
    setCategories(progress.categories || initialCategories);
    setOverallCorrect(progress.overallCorrect || 0);
    setOverallTotal(progress.overallTotal || 0);
    setIsExamStarted(true);
    const { stem, choices } = parseQuestion(progress.questionText);
    setQuestionStem(stem);
    setOptions(choices);
    closeLoadProgressModal();
  };

  const handleDeleteProgress = async (id) => {
    if (!currentUser) {
      alert('Log in to delete progress');
      return;
    }
    try {
      await deleteDoc(doc(db, 'examProgress', id));
      fetchSavedProgresses();
    } catch (err) {
      console.error('Error deleting progress:', err);
      alert('Error deleting progress.');
    }
  };

  // -----------------------------
  // Check for authentication after all hooks
  // -----------------------------
  if (!currentUser) {
    return (
      <div className={clsx('flex items-center justify-center h-screen', isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}>
        <div className={clsx('text-center p-6', isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700', 'rounded shadow-md')}>
          <p className="mb-4">
            Please{' '}
            <a href="/login" className={clsx('underline', isDarkMode ? 'text-blue-400' : 'text-blue-900')}>
              log in
            </a>{' '}
            to use the Practice Exam tool.
          </p>
          <button
            onClick={() => router.push('/login')}
            className={clsx('px-4 py-2 rounded', isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-900 text-white hover:bg-blue-700')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------
  // Additional modal state handlers
  // -----------------------------
  const isProUser = userDataObj?.billing?.plan === 'Pro' || userDataObj?.billing?.plan === 'Developer';
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const openConfigModal = () => setIsConfigModalOpen(true);
  const closeConfigModal = () => setIsConfigModalOpen(false);
  const openLoadProgressModal = () => {
    fetchSavedProgresses();
    setIsLoadProgressModalOpen(true);
  };
  const closeLoadProgressModal = () => setIsLoadProgressModalOpen(false);
  const openResultModal = () => setIsResultModalOpen(true);
  const closeResultModal = () => setIsResultModalOpen(false);

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'text-white' : 'text-gray-800')}>
      {/* Sidebar is always visible */}
      <Sidebar activeLink="/ailawtools/examprep" isSidebarVisible={true} isDarkMode={isDarkMode} />

      {/* Floating Top-Right Controls */}
      <div className="absolute top-6 right-[5%] z-[100] flex flex-col items-center gap-2">
        <div className="flex flex-col items-center">
          <motion.button
            onClick={openLoadProgressModal}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white transition-all duration-200 shadow-lg"
            aria-label="Load Progress"
          >
            <FaSyncAlt size={20} />
          </motion.button>
          <span className="text-xs mt-1">Load Saves</span>
        </div>
        <div className="flex flex-col items-center">
          <motion.button
            onClick={openConfigModal}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white transition-all duration-200 shadow-lg"
            aria-label="Configure Exam"
          >
            <FaChevronDown size={20} />
          </motion.button>
          <span className="text-xs mt-1">Configure</span>
        </div>
      </div>

      <main className="flex-1 flex flex-col px-6 relative z-200 h-screen">
        <motion.div
          className={clsx(
            'flex-1 w-full rounded-xl shadow-lg p-6 overflow-y-auto mx-auto my-4',
            isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800'
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Exam Progress Header */}
          {isExamStarted && (
            <div className={clsx('w-full max-w-5xl mb-4 p-4 rounded-lg shadow-md flex justify-between items-center', isDarkMode ? 'bg-gray-700' : 'bg-white')}>
              <span className={isDarkMode ? 'text-white' : 'text-gray-700'}>
                Questions Answered: {currentQuestionCount} / {examConfig.questionLimit}
              </span>
              <span className={clsx('px-3 py-1 rounded-full text-sm font-semibold uppercase', isProUser ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700')}>
                {isProUser ? 'Pro User' : 'Base User'}
              </span>
            </div>
          )}

          {/* Exam Question Card */}
          {(questionStem || questionText) && (
            <motion.div
              className={clsx('relative w-full max-w-xl p-6 mx-auto rounded-xl shadow-md', isDarkMode ? 'bg-gray-700' : 'bg-white')}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-2 text-center">Practice Question</h2>
              {questionStem && <p className="mb-4 text-center">{questionStem}</p>}
              {options.length > 0 && (
                <ul className="list-none mb-4">
                  {options.map((option, idx) => (
                    <li key={idx} className={clsx('mb-2 text-center', isDarkMode ? 'text-white' : 'text-gray-800')}>
                      {option}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-center mb-4">
                <div className="relative flex bg-gray-200 rounded-full p-0.5">
                  <motion.div
                    className="absolute top-0 left-0 w-1/2 h-full bg-blue-900 rounded-full"
                    initial={false}
                    animate={{ x: answerMode === 'written' ? 0 : '100%' }}
                    transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                  />
                  <button
                    onClick={() => setAnswerMode('written')}
                    className={clsx('relative w-1/2 px-2 py-1 text-sm rounded-full focus:outline-none', answerMode === 'written' ? 'text-white' : 'text-gray-700')}
                  >
                    Written
                  </button>
                  <button
                    onClick={() => setAnswerMode('multiple-choice')}
                    className={clsx('relative w-1/2 px-2 py-1 text-sm rounded-full focus:outline-none', answerMode === 'multiple-choice' ? 'text-white' : 'text-gray-700')}
                  >
                    Multiple Choice
                  </button>
                </div>
              </div>
              <div>
                {answerMode === 'written' ? (
                  <textarea
                    className={clsx('w-full p-4 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200', isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-800')}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter your essay/short-answer response..."
                    rows={6}
                    disabled={isLoading}
                    aria-label="Answer Input"
                  />
                ) : (
                  <div className="flex flex-col space-y-2">
                    {options.map((option, index) => {
                      const letter = getOptionLetter(option);
                      if (!letter) return null;
                      return (
                        <label key={index} className={clsx('flex items-center', isDarkMode ? 'text-white' : 'text-gray-700')}>
                          <input
                            type="radio"
                            name="multipleChoiceAnswer"
                            value={letter}
                            checked={inputText === letter}
                            onChange={(e) => setInputText(e.target.value)}
                            className={clsx('form-radio h-4 w-4', isDarkMode ? 'text-blue-900' : 'text-blue-900', 'focus:ring-blue-500 border-gray-300 rounded')}
                            disabled={isLoading}
                          />
                          <span className="ml-2">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleSubmitAnswer}
                  className={clsx(
                    'flex-1 px-4 py-3 rounded font-semibold transition-colors duration-200 shadow-md',
                    isLoading || !inputText.trim()
                      ? isDarkMode
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-900 hover:bg-blue-950 text-white'
                  )}
                  disabled={isLoading || !inputText.trim()}
                  aria-label="Submit Answer"
                >
                  {isLoading ? 'Submitting...' : 'Submit Answer'}
                </button>
                <button
                  onClick={handleSaveProgress}
                  className={clsx(
                    'flex items-center justify-center px-4 py-3 rounded',
                    isDarkMode ? 'bg-transparent text-white hover:text-slate-500' : 'bg-transparent text-blue-950 hover:text-slate-500',
                    'transition-colors duration-200'
                  )}
                  disabled={!currentUser}
                  aria-label="Save Progress"
                >
                  <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.5 }}>
                    <FaSave size={24} />
                  </motion.div>
                </button>
                <button
                  onClick={handleGetQuestion}
                  className={clsx(
                    'flex items-center justify-center px-4 py-3 rounded',
                    isDarkMode ? 'bg-transparent text-white hover:text-slate-500' : 'bg-transparent text-blue-950 hover:text-slate-500',
                    'transition-colors duration-200'
                  )}
                  disabled={isLoading}
                  aria-label="Generate New Question"
                >
                  <motion.div whileHover={{ scale: 1.2, rotate: -360 }} transition={{ duration: 0.5 }}>
                    <FaSyncAlt size={24} />
                  </motion.div>
                </button>
              </div>
            </motion.div>
          )}

          {!questionStem && !questionText && (
            <div className={clsx('w-full max-w-5xl p-6 rounded-lg shadow-md text-center mx-auto', isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-black')}>
              <p className={clsx('mb-4', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                Click <span className="font-semibold">Configure</span> to begin your Practice Exam.
              </p>
              <p className={clsx('text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
                <strong>Note:</strong> This tool is intended for law students to practice essay/MC questions.
              </p>
            </div>
          )}

          {/* Result Modal */}
          <AnimatePresence>
            {isResultModalOpen && (
              <motion.div
                className={clsx('fixed inset-0 flex items-center justify-center', isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50', 'z-50')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className={clsx('p-8 rounded-lg w-11/12 max-w-md shadow-lg overflow-y-auto', isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black')}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className={clsx('text-2xl font-semibold mb-6', isDarkMode ? 'text-white' : 'text-gray-800')}>
                    Answer Feedback
                  </h2>
                  <p className={clsx('mb-6', isDarkMode ? 'text-gray-300' : 'text-gray-800')}>{answerResult}</p>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={closeResultModal}
                      className={clsx('h-10 sm:h-12 px-4 py-2 rounded', isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700', 'transition-colors duration-200 text-sm sm:text-base')}
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
                      className={clsx('h-10 sm:h-12 px-4 py-2 rounded', isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-900 hover:bg-blue-950 text-white', 'transition-colors duration-200 text-sm sm:text-base')}
                      disabled={isLoading}
                      aria-label="Next Question"
                    >
                      {isLoading ? 'Loading...' : 'Next Question'}
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
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className={clsx('p-6 rounded-lg w-11/12 max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto', isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800')}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl mb-4 text-center">Final Feedback</h2>
                  {answeredQuestions.map((card, idx) => (
                    <div key={idx} className={clsx('mb-4 p-4 rounded border', isDarkMode ? 'border-gray-700' : 'border-gray-800')}>
                      <p className="mb-1 text-blue-300 text-center">Question {idx + 1}</p>
                      <p className="text-center"><strong>Question:</strong> {card.question}</p>
                      <p className="text-center"><strong>Your Answer:</strong> {card.answer}</p>
                      <p className="text-center"><strong>Feedback:</strong> {card.feedback}</p>
                      <p className={clsx('font-bold mt-1 text-center', card.correct ? 'text-emerald-500' : 'text-red-500')}>
                        {card.correct ? '✓ Correct' : '✗ Incorrect'}
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

          {/* Load Progress Modal */}
          <AnimatePresence>
            {isLoadProgressModalOpen && (
              <motion.div
                className={clsx('fixed inset-0 bg-black bg-opacity-50 z-[151] flex items-center justify-center')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className={clsx('p-8 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-screen', isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black')}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className={clsx('text-2xl font-semibold mb-6', isDarkMode ? 'text-white' : 'text-gray-800')}>Load Saved Progress</h2>
                  {savedProgresses.length === 0 ? (
                    <p className={clsx(isDarkMode ? 'text-gray-300' : 'text-gray-700')}>No saved progress found.</p>
                  ) : (
                    <ul className="space-y-4">
                      {savedProgresses.map((progress) => (
                        <li key={progress.id} className={clsx('p-4 border rounded', isDarkMode ? 'border-gray-600' : 'border-gray-200')}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={clsx('font-semibold', isDarkMode ? 'text-blue-300' : 'text-blue-900')}>
                                Exam Type: {progress.examConfig.examType}
                              </p>
                              <p className="text-sm">Subject: {progress.examConfig.lawSubject}</p>
                              <p className="text-sm">Difficulty: {progress.examConfig.difficulty}</p>
                              <p className="text-sm">Questions: {progress.examConfig.questionLimit}</p>
                              <p className="text-sm">Saved on: {new Date(progress.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => handleLoadProgress(progress)}
                                className="h-10 w-20 sm:w-24 rounded bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm sm:text-base flex items-center justify-center transition-all duration-200"
                                aria-label="Load Progress"
                              >
                                Load
                              </button>
                              <button
                                onClick={() => handleDeleteProgress(progress.id)}
                                className="h-10 w-20 sm:w-24 rounded bg-red-600 text-white text-sm sm:text-base flex items-center justify-center transition-colors duration-200 hover:bg-red-700"
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
                  <div className="text-center mt-6">
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
        </motion.div>
      </main>

      {/* -----------------------------
           Configure Exam Modal 
           (Style copied from the AI Tutor component)
      ----------------------------- */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-8 rounded-lg w-11/12 max-w-md shadow-2xl overflow-y-auto max-h-screen"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-2xl font-bold w-full text-center text-white">Configure Exam</h2>
                <button onClick={closeConfigModal} className="text-xl font-semibold text-gray-400 hover:text-gray-200">&times;</button>
              </div>
              <form>
                <div className="mb-4">
                  <label className="block mb-2 text-white">Exam Type</label>
                  <select
                    name="examType"
                    value={examConfig.examType}
                    onChange={(e) =>
                      setExamConfig((prev) => ({ ...prev, examType: e.target.value }))
                    }
                    className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  >
                    {examTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-white">Law Subject</label>
                  <select
                    name="lawSubject"
                    value={examConfig.lawSubject}
                    onChange={(e) =>
                      setExamConfig((prev) => ({ ...prev, lawSubject: e.target.value }))
                    }
                    className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  >
                    {lawSubjectOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-white">Difficulty</label>
                    <select
                      name="difficulty"
                      value={examConfig.difficulty}
                      onChange={(e) =>
                        setExamConfig((prev) => ({ ...prev, difficulty: e.target.value }))
                      }
                      className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    >
                      {difficultyOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-white">Question Limit</label>
                    <input
                      type="number"
                      name="questionLimit"
                      value={examConfig.questionLimit}
                      onChange={(e) =>
                        setExamConfig((prev) => ({ ...prev, questionLimit: e.target.value }))
                      }
                      className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                      min="1"
                    />
                  </div>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-white font-medium">Instant Feedback</label>
                    <input
                      type="checkbox"
                      name="instantFeedback"
                      checked={examConfig.instantFeedback}
                      onChange={(e) =>
                        setExamConfig((prev) => ({ ...prev, instantFeedback: e.target.checked }))
                      }
                      className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-white font-medium">Time Limit (min)</label>
                    <input
                      type="number"
                      name="timeLimit"
                      value={examConfig.timeLimit}
                      onChange={(e) =>
                        setExamConfig((prev) => ({ ...prev, timeLimit: e.target.value }))
                      }
                      className="h-8 w-16 p-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                      min="0"
                    />
                  </div>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-white font-medium">Include Curve Balls</label>
                    <input
                      type="checkbox"
                      name="includeCurveBalls"
                      checked={examConfig.includeCurveBalls}
                      onChange={(e) =>
                        setExamConfig((prev) => ({ ...prev, includeCurveBalls: e.target.checked }))
                      }
                      className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-white font-medium">Allow Multiple Choice</label>
                    <input
                      type="checkbox"
                      name="allowMultipleChoice"
                      checked={examConfig.allowMultipleChoice}
                      onChange={(e) =>
                        setExamConfig((prev) => ({ ...prev, allowMultipleChoice: e.target.checked }))
                      }
                      className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white font-medium">Prefer Essay Style</label>
                  <input
                    type="checkbox"
                    name="preferEssayStyle"
                    checked={examConfig.preferEssayStyle}
                    onChange={(e) =>
                      setExamConfig((prev) => ({ ...prev, preferEssayStyle: e.target.checked }))
                    }
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="mb-6">
                  <label className="block mb-2 text-white font-medium">Extra Instructions</label>
                  <textarea
                    name="extraInstructions"
                    value={examConfig.extraInstructions}
                    onChange={(e) =>
                      setExamConfig((prev) => ({ ...prev, extraInstructions: e.target.value }))
                    }
                    placeholder="Additional notes or instructions..."
                    className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={closeConfigModal}
                    className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={closeConfigModal}
                    className="px-6 py-2 rounded bg-blue-900 text-white hover:bg-blue-950 transition-colors duration-200"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { ExamPrep };
