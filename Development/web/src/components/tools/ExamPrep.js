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
  const { currentUser } = useAuth();
  const router = useRouter();

  const [inputText, setInputText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answerResult, setAnswerResult] = useState('');
  const [typedResult, setTypedResult] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);

  // Exam configuration state
  const [examConfig, setExamConfig] = useState({
    examType: 'LSAT',
    difficulty: '',
    lawType: 'General Law',
  });

  // Difficulty options based on the selected exam
  const difficultyMapping = {
    LSAT: [
      { value: 'Below 150', label: 'Below 150' },
      { value: '150-160', label: '150-160' },
      { value: '160-170', label: '160-170' },
      { value: 'Above 170', label: 'Above 170' },
    ],
    BAR: [
      { value: '60%', label: '60% Correct' },
      { value: '70%', label: '70% Correct' },
      { value: '80%', label: '80% Correct' },     
      { value: '90%', label: '90% Correct' },
    ],
    MPRE: [
      { value: 'Low (Below 85)', label: 'Low (Below 85)' },
      { value: 'Medium (85-95)', label: 'Medium (85-95)' },
      { value: 'High (95+)', label: 'High (95+)' },
    ],
    // Add more exams as needed
  };

  // State for difficulty options
  const [difficultyOptions, setDifficultyOptions] = useState(difficultyMapping['LSAT']);

  // Update difficulty options when examType changes
  useEffect(() => {
    const options = difficultyMapping[examConfig.examType] || [];
    setDifficultyOptions(options);
    // Set the default difficulty to the first option
    setExamConfig((prevConfig) => ({
      ...prevConfig,
      difficulty: options[0]?.value || '',
    }));
  }, [examConfig.examType]);

  // Function to fetch a new exam question based on configuration
  const handleGetQuestion = async () => {
    setIsLoading(true);
    setQuestionText('');
    setAnswerResult('');
    setTypedResult('');
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
    } catch (error) {
      console.error('Error fetching exam question:', error);
      setQuestionText('An error occurred while fetching the exam question.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to submit the user's answer and get feedback
  const handleSubmitAnswer = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setAnswerResult('');
    setTypedResult('');

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

      const { feedback } = await response.json();
      setAnswerResult(feedback);
      openResultModal();
    } catch (error) {
      console.error('Error submitting answer:', error);
      setAnswerResult('An error occurred while submitting your answer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Typing effect for feedback
  useEffect(() => {
    if (answerResult) {
      setTypedResult('');
      let index = 0;
      const typingInterval = setInterval(() => {
        setTypedResult((prev) => prev + answerResult[index]);
        index++;
        if (index >= answerResult.length) {
          clearInterval(typingInterval);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [answerResult]);

  // Toggle functions for modals and sidebar
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

  // Handle configuration changes
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setExamConfig((prevConfig) => ({
      ...prevConfig,
      [name]: value,
    }));
  };

  const handleStartExamPrep = () => {
    closeConfigModal();
    handleGetQuestion();
  };

  // Function to save progress to Firebase
  const handleSaveProgress = async () => {
    if (!currentUser) {
      alert('You need to be logged in to save your progress.');
      return;
    }

    try {
      const progressData = {
        userId: currentUser.uid,
        examConfig,
        questionText,
        inputText,
        answerResult,
        timestamp: new Date().toISOString(),
      };

      // Add the progress data to Firestore
      await addDoc(collection(db, 'examProgress'), progressData);

      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('An error occurred while saving your progress.');
    }
  };

  // Function to fetch saved progresses from Firebase
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

  // Function to load a saved progress
  const handleLoadProgress = (progress) => {
    setExamConfig(progress.examConfig);
    setQuestionText(progress.questionText);
    setInputText(progress.inputText);
    setAnswerResult(progress.answerResult);
    closeLoadProgressModal();
  };

  // Function to delete a saved progress from Firebase
  const handleDeleteProgress = async (id) => {
    if (!currentUser) {
      alert('You need to be logged in to delete your progress.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'examProgress', id));

      // Refresh the list of saved progresses
      fetchSavedProgresses();
    } catch (error) {
      console.error('Error deleting progress:', error);
      alert('An error occurred while deleting the progress.');
    }
  };

  // If the user is not authenticated, prompt them to log in
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-700">
          Please <a href="/login" className="text-blue-600 underline">log in</a> to use the Exam Prep tool.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {isSidebarVisible && <Sidebar activeLink="/ailawtools/examprep" />}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center p-4 bg-white">
        <div className="flex-1 w-full max-w-4xl p-4 bg-gray-100 max-h-128 rounded-lg shadow-md">
          <div className="flex flex-col h-full">
            {/* Header Buttons */}
            <div className="flex items-start justify-between w-full mb-4">
              <button
                onClick={toggleSidebar}
                className="gap-4 border border-solid border-blue-950 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
              >
                {isSidebarVisible ? 'Hide' : 'Show'}
              </button>
              <div>
                <button
                  onClick={openLoadProgressModal}
                  className="gap-4 mr-2 border border-solid border-blue-950 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                  disabled={!currentUser}
                >
                  Load Progress
                </button>
                <button
                  onClick={openConfigModal}
                  className="gap-4 border border-solid border-blue-950 bg-white text-blue-950 px-4 py-2 rounded-md duration-200 hover:bg-blue-950 hover:text-white"
                >
                  Configure Exam Prep
                </button>
              </div>
            </div>

            {/* Exam Question Display */}
            {questionText && (
              <div className="mb-4 p-4 bg-white rounded shadow overflow-y-scroll">
                <h3 className="text-lg font-semibold text-blue-950">Exam Question</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{questionText}</p>
              </div>
            )}

            {/* Answer Input */}
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

            {/* Action Buttons */}
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
                  className="border border-solid border-green-600 bg-white text-green-600 px-4 py-2 rounded-md duration-200 hover:bg-green-600 hover:text-white"
                  disabled={!currentUser}
                >
                  Save Progress
                </button>
              </div>
            )}

            {/* Prompt to Configure Exam Prep */}
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
      </main>

      {/* Exam Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Configure Exam Prep</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Exam Type</label>
              <select
                name="examType"
                value={examConfig.examType}
                onChange={handleConfigChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="LSAT">LSAT</option>
                <option value="BAR">Bar Exam</option>
                <option value="MPRE">MPRE</option>
                {/* Add more exams as needed */}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Difficulty</label>
              <select
                name="difficulty"
                value={examConfig.difficulty}
                onChange={handleConfigChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Type of Law</label>
              <select
                name="lawType"
                value={examConfig.lawType}
                onChange={handleConfigChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="General Law">General Law</option>
                <option value="Criminal Law">Criminal Law</option>
                <option value="Civil Procedure">Civil Procedure</option>
                <option value="Constitutional Law">Constitutional Law</option>
                <option value="Contracts">Contracts</option>
                <option value="Torts">Torts</option>
                <option value="Intellectual Property Law">Intellectual Property Law</option>
                <option value="Evidence">Evidence</option>
                {/* Add more types as needed */}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleStartExamPrep}
                className="mr-2 border border-solid border-blue-950 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
              >
                Start Exam Prep
              </button>
              <button
                onClick={closeConfigModal}
                className="border border-solid border-gray-500 bg-white text-gray-700 px-4 py-2 rounded-md duration-200 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Answer Feedback Modal */}
      {isResultModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Feedback</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{typedResult}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  closeResultModal();
                  // Prepare for next question
                  handleGetQuestion();
                  setInputText('');
                }}
                className="border border-solid border-blue-950 bg-blue-950 text-white px-4 py-2 rounded-md duration-200 hover:bg-white hover:text-blue-950"
              >
                Next Question
              </button>
              <button
                onClick={closeResultModal}
                className="ml-2 border border-solid border-gray-500 bg-white text-gray-700 px-4 py-2 rounded-md duration-200 hover:bg-gray-100"
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
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Load Progress</h2>
            {savedProgresses.length > 0 ? (
              <ul className="mb-4">
                {savedProgresses.map((progress) => (
                  <li key={progress.id} className="flex justify-between items-center mb-2">
                    <div>
                      <button
                        onClick={() => handleLoadProgress(progress)}
                        className="text-blue-600 underline"
                      >
                        {new Date(progress.timestamp).toLocaleString()}
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteProgress(progress.id)}
                      className="text-red-600 underline"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved progresses found.</p>
            )}
            <div className="flex justify-end">
              <button
                onClick={closeLoadProgressModal}
                className="border border-solid border-gray-500 bg-white text-gray-700 px-4 py-2 rounded-md duration-200 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
