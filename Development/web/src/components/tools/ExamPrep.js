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
import { FaBars, FaTimes, FaSave, FaSyncAlt } from 'react-icons/fa'; // Imported FaSave and FaSyncAlt
import { motion, AnimatePresence } from 'framer-motion';

export default function ExamPrep() {
  const { currentUser, userDataObj } = useAuth(); // Include userDataObj for plan check
  const router = useRouter();

  const [inputText, setInputText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionStem, setQuestionStem] = useState('');
  const [options, setOptions] = useState([]);
  const [answerResult, setAnswerResult] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // Default to hidden on mobile
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [isFinalFeedbackModalOpen, setIsFinalFeedbackModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);

  // Track the number of questions answered in the current set
  const [currentQuestionCount, setCurrentQuestionCount] = useState(0);

  // Track answered questions with details
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  // Flag to determine if exam prep has started
  const [isExamStarted, setIsExamStarted] = useState(false);

  const [examConfig, setExamConfig] = useState({
    examType: 'LSAT',
    difficulty: '',
    lawType: 'General Law',
    questionLimit: 5, // Default to 5 questions
    instantFeedback: true, // New field to control instant feedback
    selectedQuestionTypes: [], // New field for selected question types
  });

  // Answer mode state variable
  const [answerMode, setAnswerMode] = useState('written'); // Default to 'written' mode

  // Mapping for difficulty levels based on exam type
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

  // Mapping for law types based on exam type
  const lawTypeMapping = {
    LSAT: ['General Law'], // LSAT doesn't cover specific law subjects
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

  // Question Types for LSAT
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

  // Update difficulty and law type options when exam type changes
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

  // Utility function to extract the option letter
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

      // Parse the question to extract stem and options
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
        // If we're in the options section and the line doesn't start with an option label, it's a continuation of the previous option
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

    // Find the selected option text based on the letter
    const selectedOption = options.find(
      (option) => getOptionLetter(option) === inputText
    );

    try {
      const response = await fetch('/api/submit-exam-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
          answer: inputText, // Sending the option letter (e.g., 'A', 'B')
          examType: examConfig.examType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const { feedback, correct } = await response.json(); // Assuming API returns 'feedback' and 'correct'

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
    // Optionally, prompt the user to reconfigure or start a new set
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
      // Ensure all fields are defined
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
    setCurrentQuestionCount(progress.currentQuestionCount); // Restore the question count
    setAnsweredQuestions(progress.answeredQuestions || []); // Restore answered questions
    setIsExamStarted(true); // Ensure the question counter is visible

    // Parse the questionText to update questionStem and options
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

  const isProUser = userDataObj?.billing?.plan === 'Pro' || userDataObj?.billing?.plan === 'Developer';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* AnimatePresence for Sidebar */}
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            {/* Sidebar Component */}
            <Sidebar
              activeLink="/ailawtools/examprep"
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebarVisibility}
            />

            {/* Overlay */}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center p-6 overflow-auto">
        {/* Header */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-6">
          {/* Animated Toggle Sidebar Button */}
          <button
            onClick={toggleSidebarVisibility}
            className="text-gray-600 hover:text-gray-800 "
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

          {/* Pro+ Mode Button */}
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

        {/* Configuration and Control Buttons */}
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

        {/* Question Counter */}
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

        {/* Exam Question */}
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
              // Written Answer Mode
              <textarea
                className="w-full p-4 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your answer..."
                rows="6"
                disabled={isLoading}
              ></textarea>
            ) : (
              // Multiple Choice Mode
              <div className="flex flex-col space-y-2">
                {options.map((option, index) => {
                  const optionLetter = getOptionLetter(option);
                  if (!optionLetter) return null; // Skip if no valid option letter

                  return (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name="multipleChoiceAnswer"
                        value={optionLetter}
                        checked={inputText === optionLetter}
                        onChange={(e) => setInputText(e.target.value)}
                        className="form-radio h-4 w-4 text-blue-900"
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

        {/* Placeholder Content */}
        {!questionStem && !questionText && (
          <div className="w-full max-w-5xl p-6 bg-white rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">
              Click <span className="font-semibold">Configure Exam Prep</span> to start.
            </p>
            <p className="text-gray-500 text-sm">
              <strong>Important Note:</strong> This is not an official test prep for any law exam
              (LSAT, Bar, etc.) and is intended solely to give users an idea of the types of
              questions on those exams. We are not affiliated with any of these exams in any way.
            </p>
          </div>
        )}

        {/* Configuration Modal */}
        {isConfigModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[151]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-lg w-11/12 max-w-md shadow-lg overflow-y-auto max-h-screen"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Configure Exam Prep</h2>
              <form>
                {/* Exam Type */}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Exam Type:</label>
                  <select
                    name="examType"
                    value={examConfig.examType}
                    onChange={handleConfigChange}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <option value="LSAT">LSAT</option>
                    <option value="BAR">BAR</option>
                    <option value="MPRE">MPRE</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Score Range:</label>
                  <select
                    name="difficulty"
                    value={examConfig.difficulty}
                    onChange={handleConfigChange}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
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
                  <label className="block text-gray-700 mb-2">Law Type:</label>
                  <select
                    name="lawType"
                    value={examConfig.lawType}
                    onChange={handleConfigChange}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
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
                      <label className="block text-gray-700 mb-2">Logical Reasoning Types:</label>
                      {logicalReasoningQuestionTypes.map((type) => (
                        <div key={type} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={`lr-${type}`}
                            name={type}
                            checked={examConfig.selectedQuestionTypes.includes(type)}
                            onChange={(e) => handleQuestionTypeChange(e, type)}
                            className="h-5 w-5 text-blue-900 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`lr-${type}`} className="ml-3 block text-gray-700">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Reading Comprehension Question Types */}
                    <div className="mb-2">
                      <label className="block text-gray-700 mb-2">Reading Comprehension Types:</label>
                      {readingComprehensionQuestionTypes.map((type) => (
                        <div key={type} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={`rc-${type}`}
                            name={type}
                            checked={examConfig.selectedQuestionTypes.includes(type)}
                            onChange={(e) => handleQuestionTypeChange(e, type)}
                            className="h-5 w-5 text-blue-900 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`rc-${type}`} className="ml-3 block text-gray-700">
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
                    className="h-5 w-5 text-blue-900 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="instantFeedback" className="ml-3 block text-gray-700">
                    Enable Instant Feedback
                  </label>
                </div>

                {/* Question Limit Slider */}
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">
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
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      id="questionLimit"
                    />
                    <span className="ml-4 text-gray-700">{examConfig.questionLimit}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleStartExamPrep}
                    className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
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
                    className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded shadow-md hover:bg-gray-400 transition-colors duration-200"
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
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-lg w-11/12 max-w-md shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Answer Feedback</h2>
              <p className="text-gray-800 mb-6">{answerResult}</p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeResultModal}
                  className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
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
                  className="px-6 py-3 bg-blue-900 text-white rounded hover:bg-blue-700 transition-colors duration-200"
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
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-lg w-11/12 max-w-3xl shadow-lg max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Session Feedback</h2>
              <ul className="space-y-4">
                {answeredQuestions.map((item, index) => (
                  <li key={index} className="p-4 border border-gray-200 rounded">
                    <p className="font-semibold text-blue-900 mb-2">
                      Question {index + 1}:
                    </p>
                    <p className="text-gray-700 mb-2">{item.question}</p>
                    <p className="text-gray-800 mb-1">
                      <span className="font-semibold">Your Answer:</span> {item.answer}
                    </p>
                    <p className="text-gray-800 mb-1">
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
                  className="px-6 py-3 bg-blue-900 text-white rounded hover:bg-blue-700 transition-colors duration-200"
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
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[151]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Load Saved Progress</h2>
              {savedProgresses.length === 0 ? (
                <p className="text-gray-700">No saved progresses found.</p>
              ) : (
                <ul className="space-y-4">
                  {savedProgresses.map((progress) => (
                    <li key={progress.id} className="p-4 border border-gray-200 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-blue-900">
                            Exam Type: {progress.examConfig.examType}
                          </p>
                          <p className="text-sm text-gray-600">
                            Law Type: {progress.examConfig.lawType}
                          </p>
                          <p className="text-sm text-gray-600">
                            Difficulty: {progress.examConfig.difficulty}
                          </p>
                          <p className="text-sm text-gray-600">
                            Number of Questions Set: {progress.examConfig.questionLimit}
                          </p>
                          <p className="text-sm text-gray-600">
                            Current Question: {progress.currentQuestionCount}
                          </p>
                          <p className="text-sm text-gray-600">
                            Saved on: {new Date(progress.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleLoadProgress(progress)}
                            className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                            aria-label="Load Progress"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(progress.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
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
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
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
