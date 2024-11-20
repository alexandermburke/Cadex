// ExamPrep.js
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';

// Import Firebase and authentication
import { db } from '@/firebase';
import { doc, collection, addDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

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
          instantFeedback: examConfig.instantFeedback !== undefined ? examConfig.instantFeedback : true,
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
      const q = query(
        collection(db, 'examProgress'),
        where('userId', '==', currentUser.uid)
      );
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
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-700">
          Please <a href="/login" className="text-blue-950 underline">log in</a> to use the Exam Prep tool.
        </p>
      </div>
    );
  }

  const isProUser = userDataObj?.billing?.plan === 'Pro';

  return (
    <div className="flex h-screen bg-gray-100">
      {isSidebarVisible && <Sidebar activeLink="/ailawtools/examprep" />}
      <main className="flex-1 flex flex-col items-center p-4 bg-white">
        <div className="flex-1 w-full max-w-4xl p-4 bg-gray-100 max-h-128 rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between w-full mb-4">
              <div>
                <button
                  onClick={toggleSidebar}
                  className="gap-4 border border-solid border-blue-950 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
                >
                  {isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
                </button>
                <button
                  onClick={() => {
                    if (isProUser) {
                      router.push('/ailawtools/examprep/full-mode');
                    } else {
                      alert('Pro+ Mode is only available for Pro users. Upgrade to access this feature.');
                    }
                  }}
                  className={`gap-4 ml-2 border border-solid px-4 py-2 rounded-md duration-200 ${
                    isProUser
                      ? 'border-emerald-400 bg-emerald-400 text-white hover:bg-white hover:text-emerald-400'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isProUser}
                >
                  Pro+ Mode
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={openLoadProgressModal}
                  className="border border-solid border-blue-950 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                  disabled={!currentUser}
                >
                  Load Progress
                </button>
                <button
                  onClick={openConfigModal}
                  className="border border-solid border-blue-950 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                >
                  Configure Exam Prep
                </button>
              </div>
            </div>

            {/* Question Counter Label */}
            {isExamStarted && (
              <div className="mb-2 text-right w-full">
                <span className="text-gray-700">
                  Questions Answered: {currentQuestionCount} / {examConfig.questionLimit}
                </span>
              </div>
            )}

            {questionText && (
              <div className="mb-4 p-4 bg-white rounded shadow overflow-y-scroll">
                <h3 className="text-lg font-semibold text-blue-950">Exam Question</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{questionText}</p>
              </div>
            )}

            {questionText && (
              <div className="flex items-center mb-4">
                <textarea
                  className="flex-1 p-2 border border-gray-300 rounded"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your answer..."
                  rows="8"
                  disabled={isLoading}
                ></textarea>
              </div>
            )}

            {questionText && (
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmitAnswer}
                  className="border border-solid border-blue-950 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                  disabled={isLoading || !inputText.trim()}
                >
                  {isLoading ? 'Submitting...' : 'Submit Answer'}
                </button>
                <button
                  onClick={handleSaveProgress}
                  className="border border-solid border-emerald-400 bg-white text-emerald-400 px-4 py-2 rounded-md duration-200 hover:bg-emerald-400 hover:text-white"
                  disabled={!currentUser}
                >
                  Save Progress
                </button>
              </div>
            )}

            {!questionText && (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500 mb-2">Click Configure Exam Prep to start.</p>
                <p className="text-gray-500 text-sm text-center">
                  <strong>Important Note:</strong> This is not an official test prep for any law exam
                  (LSAT, Bar, etc.) and is intended solely to give users an idea of the types of
                  questions on those exams. We are not affiliated with any of these exams in any way.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Modal */}
        {isConfigModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-md overflow-y-auto">
              <h2 className="text-xl mb-4">Configure Exam Prep</h2>
              <form>
                {/* Exam Type */}
                <div className="mb-4">
                  <label className="block text-gray-700">Exam Type:</label>
                  <select
                    name="examType"
                    value={examConfig.examType}
                    onChange={handleConfigChange}
                    className="w-full border border-gray-300 rounded p-2"
                  >
                    <option value="LSAT">LSAT</option>
                    <option value="BAR">BAR</option>
                    <option value="MPRE">MPRE</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="mb-4">
                  <label className="block text-gray-700">Difficulty:</label>
                  <select
                    name="difficulty"
                    value={examConfig.difficulty}
                    onChange={handleConfigChange}
                    className="w-full border border-gray-300 rounded p-2"
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
                  <label className="block text-gray-700">Law Type:</label>
                  <select
                    name="lawType"
                    value={examConfig.lawType}
                    onChange={handleConfigChange}
                    className="w-full border border-gray-300 rounded p-2"
                  >
                    {lawTypeOptions.map((lawType, index) => (
                      <option key={index} value={lawType}>
                        {lawType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Instant Feedback Checkbox */}
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="instantFeedback"
                    name="instantFeedback"
                    checked={examConfig.instantFeedback}
                    onChange={handleConfigChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="instantFeedback" className="ml-2 block text-gray-700">
                    Enable Instant Feedback
                  </label>
                </div>

                {/* Question Limit Slider */}
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Number of Questions in a Row:</label>
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      id="questionLimit"
                    />
                    <span className="ml-4 text-gray-700">{examConfig.questionLimit}</span>
                  </div>
                </div>

                {/* Start Exam Prep Button */}
                <div className="flex justify-end">
                  {/* Custom Styled Start Exam Prep Button */}
                  <button
                    type="button"
                    onClick={handleStartExamPrep}
                    className="group before:ease relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-blue-950 to-slate-700 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-5 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56"
                    aria-label="Start Exam Prep"
                  >
                    <div className="flex items-center justify-center h-full">
                      Start Exam Prep
                      <i className="ml-8 fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
                    </div>
                  </button>
                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={closeConfigModal}
                    className="ml-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Result Modal */}
        {isResultModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
              <h2 className="text-xl mb-4">Answer Feedback</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{answerResult}</p>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  onClick={closeResultModal}
                  className="px-4 py-2 bg-blue-950 text-white rounded"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeResultModal();
                    handleGetQuestion();
                  }}
                  className="px-4 py-2 bg-emerald-400 text-white rounded hover:bg-green-700"
                  disabled={isLoading}
                >
                  Next Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Final Feedback Modal */}
        {isFinalFeedbackModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl overflow-y-auto max-h-[80vh]">
              <h2 className="text-xl mb-4">Session Feedback</h2>
              <ul>
                {answeredQuestions.map((item, index) => (
                  <li key={index} className="mb-4 p-4 border rounded-md">
                    <p className="font-semibold">Question {index + 1}:</p>
                    <p className="text-gray-700">{item.question}</p>
                    <p className="mt-2">
                      <span className="font-semibold">Your Answer:</span> {item.answer}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Feedback:</span> {item.feedback}
                    </p>
                    <p className={`mt-1 ${item.correct ? 'text-emerald-400' : 'text-red-600'}`}>
                      {item.correct ? 'Correct ✅' : 'Incorrect ❌'}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeFinalFeedbackModal}
                  className="px-4 py-2 bg-blue-950 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Load Progress Modal */}
        {isLoadProgressModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl overflow-y-auto max-h-full">
              <h2 className="text-xl mb-4">Load Saved Progress</h2>
              {savedProgresses.length === 0 ? (
                <p className="text-gray-700">No saved progresses found.</p>
              ) : (
                <ul>
                  {savedProgresses.map((progress) => (
                    <li key={progress.id} className="mb-4 border-b pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Exam Type: {progress.examConfig.examType}</p>
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleLoadProgress(progress)}
                            className="px-3 py-1 bg-blue-950 text-white rounded hover:bg-blue-900"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(progress.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeLoadProgressModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
