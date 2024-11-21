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
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExamPrep() {
  const { currentUser, userDataObj } = useAuth(); // Include userDataObj for plan check
  const router = useRouter();

  const [inputText, setInputText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answerResult, setAnswerResult] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
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
  });

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
    }));
  }, [examConfig.examType]);

  const handleGetQuestion = async () => {
    setIsLoading(true);
    setQuestionText('');
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
      setQuestionText(question);
      setIsExamStarted(true); // Set exam as started
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: questionText, answer: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const { feedback, correct } = await response.json(); // Assuming API returns 'feedback' and 'correct'

      // Set default values if undefined
      const feedbackText = feedback !== undefined ? feedback : 'No feedback provided.';
      const isCorrect = typeof correct === 'boolean' ? correct : false;

      setAnswerResult(feedbackText);

      // Handle feedback based on instantFeedback setting
      if (examConfig.instantFeedback) {
        openResultModal();
      } else {
        // If instant feedback is disabled, automatically proceed to the next question
        // Increment the current question count
        setCurrentQuestionCount((prevCount) => prevCount + 1);

        // Add to answeredQuestions
        setAnsweredQuestions((prevQuestions) => [
          ...prevQuestions,
          {
            question: questionText || 'No question text provided.',
            answer: inputText || 'No answer provided.',
            feedback: feedbackText,
            correct: isCorrect,
          },
        ]);

        // Automatically fetch the next question after a short delay to ensure state updates
        setTimeout(() => {
          handleGetQuestion();
        }, 500);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setAnswerResult('An error occurred while submitting your answer.');
      openResultModal(); // Optionally show error in the Result Modal
    } finally {
      setIsLoading(false);
    }
  };

  // Monitor currentQuestionCount and open final feedback modal when limit is reached
  useEffect(() => {
    if (currentQuestionCount >= examConfig.questionLimit && questionText !== '') {
      // Reset the count for the next set
      setCurrentQuestionCount(0);
      // Open the final feedback modal to allow users to review their performance
      openFinalFeedbackModal();
    }
  }, [currentQuestionCount, examConfig.questionLimit, questionText]);

  const toggleSidebar = () => {
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

      // Optional: Log progressData to verify fields
      console.log('Progress Data:', progressData);

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
            Please <a href="/login" className="text-blue-900 underline">log in</a> to use the Exam Prep tool.
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

  const isProUser = userDataObj?.billing?.plan === 'Pro';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeLink="/ailawtools/examprep" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center p-6 overflow-auto">
        {/* Header */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-6">
          {/* Animated Toggle Sidebar Button */}
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-800 rounded"
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

          {/* Professional Mode Button */}
          <button
            onClick={() => {
              if (isProUser) {
                router.push('/ailawtools/examprep/full-mode');
              } else {
                alert('Professional Mode is only available for Pro users. Upgrade to access this feature.');
              }
            }}
            className={`px-4 py-2 rounded transition-colors duration-200 ${
              isProUser
                ? 'goldBackground shadow-md bg-black text-white hover:opacity-75'
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
            className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"   
            disabled={!currentUser}
          >
            Load Progress
          </button>
          <button
            onClick={openConfigModal}
            className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"   
          >
            Configure Exam Prep
          </button>
        </div>

        {/* Question Counter */}
        {isExamStarted && (
          <div className="w-full max-w-5xl mb-4 p-4 bg-white rounded shadow-md flex justify-between items-center">
            <span className="text-gray-700">
              Questions Answered: {currentQuestionCount} / {examConfig.questionLimit}
            </span>
            <span
              className={`px-3 py-1 rounded text-sm font-semibold ${
                isProUser ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isProUser ? 'Pro User' : 'Standard User'}
            </span>
          </div>
        )}

        {/* Exam Question */}
        {questionText && (
          <div className="w-full max-w-5xl mb-6 p-6 bg-white rounded shadow-md overflow-y-scroll">
            <h3 className="text-2xl font-semibold text-blue-900 mb-4">Exam Question</h3>
            <p className="text-gray-800">{questionText}</p>
          </div>
        )}

        {/* Answer Input */}
        {questionText && (
          <div className="w-full max-w-5xl mb-6">
            <textarea
              className="w-full p-4 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your answer..."
              rows="6"
              disabled={isLoading}
            ></textarea>
          </div>
        )}

        {/* Action Buttons */}
        {questionText && (
          <div className="w-full max-w-5xl flex space-x-4">
            <button
              onClick={handleSubmitAnswer}
              className={`flex-1 px-4 py-3 rounded font-semibold text-white transition-colors duration-200 shadow-md ${
                isLoading || !inputText.trim()
                  ? 'bg-blue-400 cursor-not-allowed shadow-md'
                  : 'bg-blue-900 hover:bg-blue-950 shadow-md'
              }`}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? 'Submitting...' : 'Submit Answer'}
            </button>
            <button
              onClick={handleSaveProgress}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors duration-200"
              disabled={!currentUser}
            >
              Save Progress
            </button>
          </div>
        )}

        {/* Placeholder Content */}
        {!questionText && (
          <div className="w-full max-w-5xl p-6 bg-white rounded shadow-md text-center">
            <p className="text-gray-600 mb-4">Click <span className="font-semibold">Configure Exam Prep</span> to start.</p>
            <p className="text-gray-500 text-sm">
              <strong>Important Note:</strong> This is not an official test prep for any law exam (LSAT, Bar, etc.) and is intended solely to give users an idea of the types of questions on those exams. We are not affiliated with any of these exams in any way.
            </p>
          </div>
        )}

        {/* Configuration Modal */}
        {isConfigModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded w-11/12 max-w-md shadow-lg"
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
                  <label className="block text-gray-700 mb-2">Difficulty:</label>
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
                      className="w-full h-2 bg-blue-200 rounded appearance-none cursor-pointer"
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
                      className=""
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                          <i className="ml-8 fa-solid fa-arrow-right"></i>
               
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
              className="bg-white p-8 rounded w-11/12 max-w-md shadow-lg"
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
              className="bg-white p-8 rounded w-11/12 max-w-3xl shadow-lg max-h-[80vh] overflow-y-auto"
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
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-full"
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
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(progress.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
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
