'use client';
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBars,
  FaTimes,
  FaSave,
  FaChevronDown,
  FaSyncAlt
} from 'react-icons/fa';
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
  where
} from 'firebase/firestore';
import ExamInsight from '../ExamInsightsPanel';

export default function ExamPrep() {
  const { currentUser, userDataObj } = useAuth();
  const router = useRouter();
  const isDarkMode = userDataObj?.darkMode || false;
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
  const [currentQuestionCount, setCurrentQuestionCount] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const initialCategories = {
    Contracts: { correct: 0, total: 0 },
    Torts: { correct: 0, total: 0 },
    CriminalLaw: { correct: 0, total: 0 },
    Property: { correct: 0, total: 0 },
    Evidence: { correct: 0, total: 0 },
    ConstitutionalLaw: { correct: 0, total: 0 },
    CivilProcedure: { correct: 0, total: 0 },
    BusinessAssociations: { correct: 0, total: 0 }
  };
  const [categories, setCategories] = useState(initialCategories);
  const [overallCorrect, setOverallCorrect] = useState(0);
  const [overallTotal, setOverallTotal] = useState(0);
  const [examConfig, setExamConfig] = useState({
    examType: 'Practice Exam',
    lawSubject: 'Contracts',
    difficulty: 'Basic',
    questionLimit: 5,
    instantFeedback: false,
    selectedQuestionTypes: [],
    timeLimit: 0,
    includeCurveBalls: false,
    allowMultipleChoice: true,
    preferEssayStyle: false
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
    'BusinessAssociations'
  ];
  const difficultyOptions = ['Basic', 'Intermediate', 'Advanced', 'Expert'];
  const questionTypeOptions = [
    'Issue Spotting',
    'Rule Identification',
    'Application/Analysis',
    'Multiple-Choice Format',
    'Short-Answer/Essay'
  ];
  const [activeTab, setActiveTab] = useState('browse');

  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' } }
  };

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
      choices: choiceLines
    };
  };

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
    setInputText('');
    try {
      const response = await fetch('/api/examprep/get-exam-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examConfig)
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
          lawType: examConfig.lawSubject
        })
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
          correct: correct || false
        }
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
        openResultModal();
      } else {
        setTimeout(() => {
          handleGetQuestion();
        }, 500);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setAnswerResult('Error evaluating your answer.');
      openResultModal();
    } finally {
      setIsLoading(false);
    }
  };

  function handleConfigChange(e) {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setExamConfig((prev) => ({ ...prev, [name]: checked }));
    } else {
      setExamConfig((prev) => ({ ...prev, [name]: value }));
    }
  }

  useEffect(() => {
    if (currentQuestionCount >= examConfig.questionLimit && questionText !== '') {
      setCurrentQuestionCount(0);
      openFinalFeedbackModal();
    }
  }, [currentQuestionCount, examConfig.questionLimit, questionText]);

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
        overallTotal
      };
      await addDoc(collection(db, 'examProgress'), docData);
      alert('Progress saved. You can view it in Insights or reload it later.');
    } catch (err) {
      console.error('Error saving progress:', err);
      alert('Error saving progress.');
    }
  };

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

  if (!currentUser) {
    return (
      <div className={clsx('flex items-center justify-center h-screen', isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}>
        <div
          className={clsx(
            'text-center p-6',
            isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700',
            'rounded shadow-md'
          )}
        >
          <p className="mb-4">
            Please{' '}
            <a
              href="/login"
              className={clsx('underline', isDarkMode ? 'text-blue-400' : 'text-blue-900')}
            >
              log in
            </a>{' '}
            to use the Practice Exam tool.
          </p>
          <button
            onClick={() => router.push('/login')}
            className={clsx(
              'px-4 py-2 rounded',
              isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-900 text-white hover:bg-blue-700'
            )}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const isProUser = userDataObj?.billing?.plan === 'Pro' || userDataObj?.billing?.plan === 'Developer';
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

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'text-white' : 'text-gray-800')}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar activeLink="/ailawtools/examprep" isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} />
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
      <main className="flex-1 flex flex-col px-2 relative z-200 h-screen">
        <motion.div
          className={clsx('flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto', isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800')}
          variants={containerVariants}
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
              Practice Exam
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
          {activeTab === 'browse' && (
            <>
              <div className="flex flex-col items-center justify-center mb-4">
              </div>
            </>
          )}
          {activeTab === 'favorites' && (
            <ExamInsight />
          )}
          {isExamStarted && (
            <div
              className={clsx(
                'w-full max-w-3xl mb-4 p-4 mx-auto rounded-lg shadow-md flex items-center justify-between gap-4',
                isDarkMode ? 'bg-gray-700' : 'bg-white'
              )}
            >
              <span className={isDarkMode ? 'text-white' : 'text-gray-700'}>
                Questions Answered: {currentQuestionCount} / {examConfig.questionLimit}
              </span>
              <span
                className={clsx(
                  'px-3 py-1 rounded-full text-sm font-semibold uppercase',
                  isProUser ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                )}
              >
                {isProUser ? 'Pro User' : 'Base User'}
              </span>
            </div>
          )}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
            {questionStem && (
              <div className={clsx('w-full max-w-5xl mb-6 p-6 rounded-lg shadow-md overflow-y-scroll', isDarkMode ? 'bg-gray-700' : 'bg-white')}>
                <h3 className={clsx('text-2xl font-semibold mb-2', isDarkMode ? 'text-blue-400' : 'text-blue-900')}>
                  Practice Question
                </h3>
                <h3 className={clsx('text-sm font-medium mb-6', isDarkMode ? 'text-white' : 'text-slate-400')}>
                  Built on LExAPI Version 0.3.6
                </h3>
                <p className={clsx('mb-4', isDarkMode ? 'text-white' : 'text-gray-800')}>{questionStem}</p>
                {options.length > 0 && (
                  <ul className="list-none">
                    {options.map((option, idx) => (
                      <li key={idx} className={clsx('mb-2', isDarkMode ? 'text-white' : 'text-gray-700')}>
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {(questionStem || questionText) && (
              <div className="max-w-36 mb-2 flex items-center justify-center">
                <div className={clsx('relative flex items-center rounded-full p-1', isDarkMode ? 'bg-slate-700' : 'bg-gray-200')} style={{ width: '240px' }}>
                  <motion.div
                    className={clsx('absolute top-0 left-0 h-full rounded-full shadow', isDarkMode ? 'bg-slate-600' : 'bg-white')}
                    style={{ width: '50%' }}
                    initial={false}
                    animate={{ x: answerMode === 'written' ? '0%' : '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                  <button
                    onClick={() => setAnswerMode('written')}
                    className={clsx(
                      'relative z-10 flex-1 text-xs sm:text-sm font-semibold py-1 transition-colors',
                      answerMode === 'written'
                        ? isDarkMode
                          ? 'text-blue-300'
                          : 'text-blue-600'
                        : isDarkMode
                          ? 'text-gray-200'
                          : 'text-gray-700'
                    )}
                  >
                    Written
                  </button>
                  <button
                    onClick={() => setAnswerMode('multiple-choice')}
                    className={clsx(
                      'relative z-10 flex-1 text-xs sm:text-sm font-semibold py-1 transition-colors',
                      answerMode === 'multiple-choice'
                        ? isDarkMode
                          ? 'text-blue-300'
                          : 'text-blue-600'
                        : isDarkMode
                          ? 'text-gray-200'
                          : 'text-gray-700'
                    )}
                  >
                    Multiple
                  </button>
                </div>
              </div>
            )}
            {(questionStem || questionText) && (
              <div className="w-full max-w-5xl mb-6">
                {answerMode === 'written' ? (
                  <textarea
                    className={clsx('w-full p-4 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200', isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-800')}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter your essay/short-answer response..."
                    rows={6}
                    disabled={isLoading}
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
            )}
            {(questionStem || questionText) && (
              <div className="w-full max-w-5xl flex space-x-4">
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
            )}
            {activeTab === 'browse' && !questionStem && !questionText && (
              <div
                className={clsx(
                                   'w-full max-w-3xl p-6 rounded-lg shadow-md text-center mx-auto',
                                   isDarkMode
                                     ? 'bg-slate-800 bg-opacity-50 text-white'
                                     : 'bg-white text-gray-800'
                                 )}
              >
                <p className={clsx('mb-4', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                  Click <span className="font-semibold">Configure</span> to begin your Practice Exam.
                </p>
                <p className={clsx('text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
                  <strong>Note:</strong> This is intended for law students to practice essay/MC questions.
                </p>
              </div>
            )}
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
                      className={clsx(
                        'h-10 sm:h-12 px-4 py-2 rounded',
                        isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700',
                        'transition-colors duration-200 text-sm sm:text-base'
                      )}
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
                      className={clsx(
                        'h-10 sm:h-12 px-4 py-2 rounded',
                        isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-900 hover:bg-blue-950 text-white',
                        'transition-colors duration-200 text-sm sm:text-base'
                      )}
                      disabled={isLoading}
                      aria-label="Next Question"
                    >
                      {isLoading ? 'Loading...' : 'Next Question'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
      {isLoadProgressModalOpen && (
        <motion.div
          className={clsx('fixed inset-0 flex items-center justify-center', isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50', 'z-[151]')}
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
            <h2 className={clsx('text-2xl font-semibold mb-6', isDarkMode ? 'text-white' : 'text-gray-800')}>
              Load Saved Progress
            </h2>
            {savedProgresses.length === 0 ? (
              <p className={clsx(isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                No saved progresses found.
              </p>
            ) : (
              <ul className="space-y-4">
                {savedProgresses.map((progress) => (
                  <li key={progress.id} className={clsx('p-4 border rounded', isDarkMode ? 'border-gray-600' : 'border-gray-200')}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={clsx('font-semibold', isDarkMode ? 'text-blue-300' : 'text-blue-900')}>
                          IRAC Template: {progress.examConfig.templateType}
                        </p>
                        <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                          Legal Area: {progress.examConfig.legalArea}
                        </p>
                        <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                          Detail Level: {progress.examConfig.detailLevel}
                        </p>
                        <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                          Include Counter-Analysis: {progress.examConfig.includeCounterAnalysis ? 'Yes' : 'No'}
                        </p>
                        <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                          Number of IRAC Entries: {progress.examConfig.numberOfIrac}
                        </p>
                        <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                          Scenario: {progress.scenario || '(None)'}
                        </p>
                        <p className={clsx('text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                          Saved on: {new Date(progress.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleLoadProgress(progress)}
                          className={clsx('h-10 w-20 sm:w-24 overflow-hidden rounded', isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-900 hover:bg-blue-700 text-white', 'transition-colors duration-200 text-sm sm:text-base')}
                          aria-label="Load Progress"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteProgress(progress.id)}
                          className={clsx('h-10 w-20 sm:w-24 overflow-hidden rounded', isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white', 'transition-colors duration-200 text-sm sm:text-base')}
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
                className={clsx('h-10 sm:h-12 px-6 py-2 rounded', isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700', 'transition-colors duration-200 text-sm sm:text-base')}
                aria-label="Close Load Progress Modal"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {isConfigModalOpen && (
        <motion.div
          className={clsx('fixed inset-0 flex items-center justify-center', isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50', 'z-[152]')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={clsx('p-8 rounded-lg w-11/12 max-w-2xl shadow-lg overflow-y-auto max-h-screen', isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black')}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className={clsx('text-2xl font-semibold mb-6', isDarkMode ? 'text-white' : 'text-gray-800')}>
              Configure Exam
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm">Exam Type</label>
                <select
                  name="examType"
                  value={examConfig.examType}
                  onChange={handleConfigChange}
                  className={clsx('w-full p-2 rounded border', isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800')}
                >
                  {examTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">Subject</label>
                <select
                  name="lawSubject"
                  value={examConfig.lawSubject}
                  onChange={handleConfigChange}
                  className={clsx('w-full p-2 rounded border', isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800')}
                >
                  {lawSubjectOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">Difficulty</label>
                <select
                  name="difficulty"
                  value={examConfig.difficulty}
                  onChange={handleConfigChange}
                  className={clsx('w-full p-2 rounded border', isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800')}
                >
                  {difficultyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">Question Limit</label>
                <input
                  type="number"
                  name="questionLimit"
                  min="1"
                  max="100"
                  value={examConfig.questionLimit}
                  onChange={handleConfigChange}
                  className={clsx('w-full p-2 rounded border', isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800')}
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block mb-1 text-sm">Question Types</label>
                <select
                  multiple
                  name="selectedQuestionTypes"
                  value={examConfig.selectedQuestionTypes}
                  onChange={(e) =>
                    setExamConfig((prev) => ({
                      ...prev,
                      selectedQuestionTypes: Array.from(e.target.selectedOptions, (o) => o.value)
                    }))
                  }
                  className={clsx('w-full p-2 rounded border h-28', isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800')}
                >
                  {questionTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="instantFeedback"
                  checked={examConfig.instantFeedback}
                  onChange={handleConfigChange}
                  className="form-checkbox h-4 w-4"
                />
                <span className="text-sm">Instant Feedback</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="includeCurveBalls"
                  checked={examConfig.includeCurveBalls}
                  onChange={handleConfigChange}
                  className="form-checkbox h-4 w-4"
                />
                <span className="text-sm">Include Curve Balls</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="allowMultipleChoice"
                  checked={examConfig.allowMultipleChoice}
                  onChange={handleConfigChange}
                  className="form-checkbox h-4 w-4"
                />
                <span className="text-sm">Allow Multiple Choice</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="preferEssayStyle"
                  checked={examConfig.preferEssayStyle}
                  onChange={handleConfigChange}
                  className="form-checkbox h-4 w-4"
                />
                <span className="text-sm">Prefer Essay Style</span>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={closeConfigModal}
                className={clsx(
                  'h-10 sm:h-12 px-6 py-2 rounded',
                  isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800',
                  'transition-colors duration-200 text-sm sm:text-base gradientShadowHoverWhite'
                )}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  closeConfigModal();
                  handleGetQuestion();
                }}
                className={clsx(
                  'h-10 sm:h-12 px-6 py-2 rounded',
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-900 hover:bg-blue-950 text-white',
                  'transition-colors duration-200 text-sm sm:text-base gradientShadowHoverBlue'
                )}
              >
                Start Exam
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export { ExamPrep };
