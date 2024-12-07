// ExamPrep.js
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';

// Import Firebase and authentication
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

// Import React Icons and Framer Motion
import { FaBars, FaTimes, FaSave, FaSyncAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExamPrep() {
  const { currentUser, userDataObj } = useAuth();
  const router = useRouter();

  const userPlan = userDataObj?.billing?.plan?.toLowerCase() || 'free';
  const isProUser = userPlan === 'pro' || userPlan === 'developer' || userPlan === 'basic';

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

  const [examConfig, setExamConfig] = useState({
    examType: 'LSAT',
    difficulty: '',
    lawType: 'General Law',
    questionLimit: 5,
    instantFeedback: true,
    selectedQuestionTypes: [],
  });

  const [answerMode, setAnswerMode] = useState('written');

  // Difficulty and Law Type mappings
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

  const handleGetQuestion = async () => {
    setIsLoading(true);
    setQuestionText('');
    setQuestionStem('');
    setOptions([]);
    setAnswerResult('');
    setInputText('');

    try {
      const response = await fetch('/api/get-exam-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  const parseQuestion = (text) => {
    const lines = text.split('\n');
    let stemLines = [];
    let options = [];
    let isOptionSection = false;

    for (let line of lines) {
      line = line.trim();
      if (/^\(?[A-E]\)?[).:]?\s/.test(line)) {
        isOptionSection = true;
        options.push(line);
      } else if (isOptionSection && line) {
        if (options.length > 0) {
          options[options.length - 1] += ' ' + line;
        }
      } else {
        stemLines.push(line);
      }
    }

    const stem = stemLines.join(' ');
    return { stem, choices: options };
  };

  const handleSubmitAnswer = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setAnswerResult('');

    try {
      const response = await fetch('/api/submit-exam-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: questionText, answer: inputText, examType: examConfig.examType }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const { feedback, correct } = await response.json();
      const feedbackText = feedback !== undefined ? feedback : 'No feedback provided.';
      const isCorrect = typeof correct === 'boolean' ? correct : false;

      setAnswerResult(feedbackText);

      setAnsweredQuestions((prevQuestions) => [
        ...prevQuestions,
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

  useEffect(() => {
    if (currentQuestionCount >= examConfig.questionLimit && questionText !== '') {
      setCurrentQuestionCount(0);
      openFinalFeedbackModal();
    }
  }, [currentQuestionCount, examConfig.questionLimit, questionText]);

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
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
          instantFeedback:
            examConfig.instantFeedback !== undefined ? examConfig.instantFeedback : true,
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
    setQuestionText(progress.questionText);
    setInputText(progress.inputText);
    setAnswerResult(progress.answerResult);
    setCurrentQuestionCount(progress.currentQuestionCount);
    setAnsweredQuestions(progress.answeredQuestions || []);
    setIsExamStarted(true);

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
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded shadow-md">
          <p className="text-gray-700 mb-4">
            Please{' '}
            <a href="/login" className="text-blue-900 underline">
              log in
            </a>{' '}
            to use the Exam Prep tool.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (userPlan === 'free') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded shadow-md">
          <p className="text-gray-700 mb-4">
            Your current plan is <strong>Free</strong>. Please upgrade to Basic or Pro to access this exam preparation tool.
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-700"
          >
            View Upgrade Options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/examprep"
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebarVisibility}
            />
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebarVisibility}
            />
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col items-center p-6 overflow-auto">
        <div className="w-full max-w-5xl flex items-center justify-between mb-6">
          <button
            onClick={toggleSidebarVisibility}
            className="text-gray-600 hover:text-gray-800"
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
                alert('Professional Mode is only available for Pro users. Upgrade to access this feature.');
              }
            }}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              isProUser
                ? 'group relative h-12 w-36 overflow-hidden rounded goldBackground text-white goldShadow transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            disabled={!isProUser}
            aria-label="Professional Mode"
          >
            Pro Mode
          </button>
        </div>

        <div className="w-full max-w-5xl flex justify-end mb-4 space-x-4">
          <button
            onClick={openLoadProgressModal}
            className="group relative h-12 w-56 overflow-hidden rounded bg-blue-950 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
            aria-label="Load Progress"
          >
            Load Progress
          </button>
          <button
            onClick={openConfigModal}
            className="group relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
            aria-label="Configure Exam Prep"
          >
            Configure Exam Prep
          </button>
        </div>

        {isExamStarted && (
          <div className="w-full max-w-5xl mb-4 p-4 bg-white rounded-lg shadow-md flex justify-between items-center">
            <span className="text-gray-700">
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

        {questionStem && (
          <div className="w-full max-w-5xl mb-6 p-6 bg-white rounded-lg shadow-md overflow-y-scroll">
            <h3 className="text-2xl font-semibold text-blue-900 mb-2">Exam Question</h3>
            <h3 className="text-sm font-medium text-black mb-6">AI API Version: 0.3.4</h3>
            <p className="text-gray-800 mb-4">{questionStem}</p>
            {options.length > 0 && (
              <ul className="list-none">
                {options.map((option, index) => (
                  <li key={index} className="mb-2">
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

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

        {(questionStem || questionText) && (
          <div className="w-full max-w-5xl mb-6">
            {answerMode === 'written' ? (
              <textarea
                className="w-full p-4 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your answer..."
                rows="6"
                disabled={isLoading}
              ></textarea>
            ) : (
              <div className="flex flex-col space-y-2">
                {options.map((option, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="radio"
                      name="multipleChoiceAnswer"
                      value={option.charAt(0)}
                      checked={inputText === option.charAt(0)}
                      onChange={(e) => setInputText(e.target.value)}
                      className="form-radio h-4 w-4 text-blue-900"
                      disabled={isLoading}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {(questionStem || questionText) && (
          <div className="w-full max-w-5xl flex space-x-4">
            <button
              onClick={handleSubmitAnswer}
              className={`flex-1 px-4 py-3 rounded font-semibold text-white transition-colors duration-200 shadow-md ${
                isLoading || !inputText.trim()
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-900 hover:bg-blue-950 shadow-md'
              }`}
              disabled={isLoading || !inputText.trim()}
              aria-label="Submit Answer"
            >
              {isLoading ? 'Submitting...' : 'Submit Answer'}
            </button>
            <button
              onClick={handleSaveProgress}
              className="flex items-center justify-center px-4 py-3 bg-transparent text-blue-950 rounded font-semibold duration-200"
              disabled={!currentUser}
              aria-label="Save Progress"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <FaSave size={24} />
              </motion.div>
            </button>
            <button
              onClick={handleGetQuestion}
              className="flex items-center justify-center px-4 py-3 bg-transparent text-blue-950 rounded font-semibold duration-200"
              disabled={isLoading}
              aria-label="Generate New Question"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: -360 }}
                transition={{ duration: 0.5 }}
              >
                <FaSyncAlt size={24} />
              </motion.div>
            </button>
          </div>
        )}

        {!questionStem && !questionText && (
          <div className="w-full max-w-5xl p-6 bg-white rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">
              Click <span className="font-semibold">Configure Exam Prep</span> to start.
            </p>
            <p className="text-gray-500 text-sm">
              <strong>Important Note:</strong> This is not an official test prep for any law exam
              and is intended solely to give users an idea of the types of
              questions on those exams. We are not affiliated with any of these exams in any way.
            </p>
          </div>
        )}

        {/* Configuration, Result, Final Feedback, and Load Progress Modals follow... */}
        {isConfigModalOpen && <></>}
        {isResultModalOpen && <></>}
        {isFinalFeedbackModalOpen && <></>}
        {isLoadProgressModalOpen && <></>}

      </main>
    </div>
  );
}
