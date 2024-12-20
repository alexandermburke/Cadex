'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export default function AiTutor() {
  const { currentUser, userDataObj } = useAuth();
  const router = useRouter();

  const isDarkMode = userDataObj?.darkMode || false;
  const [inputText, setInputText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionStem, setQuestionStem] = useState('');
  const [highlightedSections, setHighlightedSections] = useState([]);
  const [answerResult, setAnswerResult] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [isFinalFeedbackModalOpen, setIsFinalFeedbackModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);

  const [currentQuestionCount, setCurrentQuestionCount] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isCommunicating, setIsCommunicating] = useState(false);

  const [tutorConfig, setTutorConfig] = useState({
    examType: 'LSAT',
    topic: 'Logical Reasoning',
    subTopic: '',
    complexity: 'Intermediate',
    questionLimit: 5,
    userPrompt: '',
    showLegalReferences: false,
    provideApproach: false,
    liveMode: false, 
    highlightHue: 60, // Default highlight hue (approximately neon yellow)
  });

  const complexityOptions = [
    { value: 'Basic', label: 'Basic' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
  ];

  const examMapping = {
    LSAT: {
      topics: [
        { value: 'Logical Reasoning', label: 'Logical Reasoning' },
        { value: 'Reading Comprehension', label: 'Reading Comprehension' },
        { value: 'Analytical Reasoning', label: 'Analytical Reasoning' },
      ],
      subTopics: {
        'Logical Reasoning': [
          { value: 'Assumption', label: 'Assumption' },
          { value: 'Strengthen', label: 'Strengthen' },
          { value: 'Weaken', label: 'Weaken' },
        ],
        'Reading Comprehension': [
          { value: 'Main Idea', label: 'Main Idea' },
          { value: 'Detail', label: 'Detail' },
          { value: 'Inference', label: 'Inference' },
        ],
        'Analytical Reasoning': [
          { value: 'Logic Games', label: 'Logic Games' },
        ],
      },
    },
    Bar: {
      topics: [
        { value: 'Criminal Law', label: 'Criminal Law' },
        { value: 'Civil Procedure', label: 'Civil Procedure' },
        { value: 'Contracts', label: 'Contracts' },
      ],
      subTopics: {
        'Criminal Law': [
          { value: 'Homicide', label: 'Homicide' },
          { value: 'Theft', label: 'Theft' },
          { value: 'Fraud', label: 'Fraud' },
        ],
        'Civil Procedure': [
          { value: 'Jurisdiction', label: 'Jurisdiction' },
          { value: 'Pleadings', label: 'Pleadings' },
          { value: 'Discovery', label: 'Discovery' },
        ],
        'Contracts': [
          { value: 'Formation', label: 'Formation' },
          { value: 'Performance', label: 'Performance' },
          { value: 'Breach', label: 'Breach' },
        ],
      },
    },
    MPRE: {
      topics: [
        { value: 'Professional Responsibility', label: 'Professional Responsibility' },
        { value: 'Ethics', label: 'Ethics' },
      ],
      subTopics: {
        'Professional Responsibility': [
          { value: 'Confidentiality', label: 'Confidentiality' },
          { value: 'Conflict of Interest', label: 'Conflict of Interest' },
        ],
        'Ethics': [
          { value: 'Advertising', label: 'Advertising' },
          { value: 'Fees', label: 'Fees' },
        ],
      },
    },
  };

  const [topicOptions, setTopicOptions] = useState(examMapping['LSAT'].topics);
  const [subTopicOptions, setSubTopicOptions] = useState(
    examMapping['LSAT'].subTopics['Logical Reasoning'] || []
  );

  useEffect(() => {
    const selectedExam = tutorConfig.examType;
    const newTopicOptions = examMapping[selectedExam]?.topics || [];
    const newSubTopicOptions = examMapping[selectedExam]?.subTopics[tutorConfig.topic] || [];

    setTopicOptions(newTopicOptions);
    setSubTopicOptions(newSubTopicOptions);

    setTutorConfig((prevConfig) => ({
      ...prevConfig,
      topic: newTopicOptions[0]?.value || '',
      subTopic: newSubTopicOptions[0]?.value || '',
    }));
  }, [tutorConfig.examType]);

  useEffect(() => {
    const selectedExam = tutorConfig.examType;
    const selectedTopic = tutorConfig.topic;
    const newSubTopicOptions = examMapping[selectedExam]?.subTopics[selectedTopic] || [];
    setSubTopicOptions(newSubTopicOptions);

    setTutorConfig((prevConfig) => ({
      ...prevConfig,
      subTopic: newSubTopicOptions[0]?.value || '',
    }));
  }, [tutorConfig.topic, tutorConfig.examType]);

  const visualizerCanvas = useRef(null);
  const animationFrameId = useRef(null);

  class Particle {
    constructor(canvasWidth, canvasHeight, config) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.config = config;
      this.reset();
    }

    reset() {
      this.x = Math.random() * this.canvasWidth;
      this.y = Math.random() * this.canvasHeight;
      const speed = Math.random() * this.config.maxSpeed;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = Math.random() * this.config.maxSize + 1;
      this.color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
      this.alpha = Math.random() * 0.5 + 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x <= 0 || this.x >= this.canvasWidth) {
        this.vx *= -1;
      }
      if (this.y <= 0 || this.y >= this.canvasHeight) {
        this.vy *= -1;
      }

      if (this.x < -50 || this.x > this.canvasWidth + 50 || this.y < -50 || this.y > this.canvasHeight + 50) {
        this.reset();
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(this.color)}, ${this.alpha})`;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
      ctx.fill();
    }
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((h) => h + h).join('');
    }
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }

  const particleConfig = {
    numParticles: 100,
    maxSpeed: 1.0,
    maxSize: 4,
    colors: ['#00FFFF', '#7B68EE', '#1E90FF', '#BA55D3', '#00CED1'],
  };

  useEffect(() => {
    const canvas = visualizerCanvas.current;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const initializeParticles = () => {
      particles = [];
      for (let i = 0; i < particleConfig.numParticles; i++) {
        particles.push(new Particle(canvas.width, canvas.height, particleConfig));
      }
    };

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      initializeParticles();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.7;

      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      connectParticles(ctx, particles, canvas.width, canvas.height);

      animationFrameId.current = requestAnimationFrame(draw);
    };

    const connectParticles = (ctx, particles, width, height) => {
      const maxDistance = 100;
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < maxDistance) {
            ctx.strokeStyle = `rgba(${hexToRgb(particles[i].color)}, ${(1 - distance / maxDistance) * 0.2})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
          }
        }
      }
      ctx.stroke();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleGetQuestion = async () => {
    setIsLoading(true);
    setIsCommunicating(true);
    setQuestionText('');
    setQuestionStem('');
    setHighlightedSections([]);
    setAnswerResult('');
    setInputText('');

    try {
      const response = await fetch('/api/tutor/get-ai-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tutorConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI question');
      }

      const { question, highlightedSections } = await response.json();
      setHighlightedSections(highlightedSections || []);

      setQuestionStem(question);
      setQuestionText(question);
      setIsSessionActive(true);
    } catch (error) {
      console.error('Error fetching AI question:', error);
      setQuestionText('An error occurred while fetching the AI question.');
    } finally {
      setIsLoading(false);
      setIsCommunicating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setIsCommunicating(true);
    setAnswerResult('');

    try {
      const response = await fetch('/api/tutor/submit-ai-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
          answer: inputText,
          examType: tutorConfig.examType,
          topic: tutorConfig.topic,
          subTopic: tutorConfig.subTopic,
          showLegalReferences: tutorConfig.showLegalReferences,
          provideApproach: tutorConfig.provideApproach,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const { feedback, correct, highlightedSections: newHighlights } = await response.json();

      const feedbackText = feedback !== undefined ? feedback : 'No feedback provided.';
      const isCorrect = typeof correct === 'boolean' ? correct : false;

      setAnswerResult(feedbackText);

      if (newHighlights && newHighlights.length > 0) {
        setHighlightedSections(newHighlights);
      }

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
    } catch (error) {
      console.error('Error submitting answer:', error);
      setAnswerResult('An error occurred while submitting your answer.');
    } finally {
      setIsLoading(false);
      setIsCommunicating(false);
    }
  };

  useEffect(() => {
    if (currentQuestionCount >= tutorConfig.questionLimit && questionText !== '') {
      setCurrentQuestionCount(0);
      openFinalFeedbackModal();
    }
  }, [currentQuestionCount, tutorConfig.questionLimit, questionText]);

  const openConfigModal = () => {
    setIsConfigModalOpen(true);
  };

  const closeConfigModal = () => {
    setIsConfigModalOpen(false);
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
    setTutorConfig((prevConfig) => ({
      ...prevConfig,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleStartTutoringSession = () => {
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
        tutorConfig: {
          examType: tutorConfig.examType || 'LSAT',
          topic: tutorConfig.topic || 'Logical Reasoning',
          subTopic: tutorConfig.subTopic || '',
          complexity: tutorConfig.complexity || 'Intermediate',
          questionLimit: tutorConfig.questionLimit || 5,
          userPrompt: tutorConfig.userPrompt || '',
          showLegalReferences: tutorConfig.showLegalReferences || false,
          provideApproach: tutorConfig.provideApproach || false,
          liveMode: tutorConfig.liveMode || false,
          highlightHue: tutorConfig.highlightHue || 60,
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

      await addDoc(collection(db, 'tutorProgress'), progressData);

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
      const q = query(collection(db, 'tutorProgress'), where('userId', '==', currentUser.uid));
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
    setTutorConfig(progress.tutorConfig);
    setQuestionText(progress.questionText);
    setInputText(progress.inputText);
    setAnswerResult(progress.answerResult);
    setCurrentQuestionCount(progress.currentQuestionCount);
    setAnsweredQuestions(progress.answeredQuestions || []);
    setIsSessionActive(true);
    setQuestionStem(progress.questionText);
    setHighlightedSections([]);

    closeLoadProgressModal();
  };

  const handleDeleteProgress = async (id) => {
    if (!currentUser) {
      alert('You need to be logged in to delete your progress.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'tutorProgress', id));
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
            to use the AI Law Tutor.
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

  const isProUser =
    userDataObj?.billing?.plan === 'Pro' || userDataObj?.billing?.plan === 'Developer';

  function messageDisplay() {
    if (isCommunicating) return 'AI is communicating...';
    return 'LExAPI v0.3.4 is ready';
  }

  const highlightedReasons = highlightedSections
    .filter((section) => section.highlight && section.reason && section.reason !== 'Not crucial')
    .map((section) => ({ text: section.text, reason: section.reason }));

  const showHighlights = tutorConfig.liveMode || answerResult;
  const highlightColor = `hsl(${tutorConfig.highlightHue}, 100%, 50%)`;

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 to-blue-800 rounded shadow-sm z-[151]">
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/contractreview"
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
              isAiTutor={true}
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

      <main className="flex-1 flex flex-col items-center p-6 overflow-auto">
        {/* Header */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-6">
          <button
            onClick={toggleSidebar}
            className="text-gray-200 hover:text-white"
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

          {/* Pro Mode Button */}
          <button
            onClick={() => {
              if (isProUser) {
                router.push('/ailawtools/aiTutor/full-mode');
              } else {
                alert('Professional Mode is only available for Pro users. Upgrade to access this feature.');
              }
            }}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              isProUser
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600'
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
            className="relative h-12 w-56 overflow-hidden rounded bg-blue-700 text-white shadow-lg hover:bg-blue-800 transition-colors duration-200"
            aria-label="Load Progress"
          >
            Load Progress
          </button>
          <button
            onClick={openConfigModal}
            className="relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-colors duration-200"
            aria-label="Configure AI Tutor"
          >
            Configure AI Tutor
          </button>
        </div>

        {/* Question Counter */}
        {isSessionActive && (
          <div className="w-full max-w-5xl mb-4 p-4 bg-white bg-opacity-20 backdrop-blur-md rounded-lg shadow-md flex justify-between items-center">
            <span className="text-white">
              Questions Answered: {currentQuestionCount} / {tutorConfig.questionLimit}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${
                isProUser ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
              }`}
            >
              {isProUser ? 'Pro User' : 'Base User'}
            </span>
          </div>
        )}

        {/* Visualizer and Feedback */}
        <div className="w-full max-w-5xl flex flex-col items-center">
          <div className="relative w-96 h-96 mb-6">
            <canvas
              ref={visualizerCanvas}
              className="absolute top-0 left-0 w-full h-full rounded-full"
            ></canvas>

            <div className="absolute inset-0 flex items-center justify-center">
              <textarea
                className="w-64 h-24 bg-transparent text-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-semibold text-lg"
                value={messageDisplay()}
                readOnly
                aria-label="AI Communication Status"
                style={{resize:'none'}}
              ></textarea>
            </div>
          </div>

          <div className="w-full max-w-5xl mb-6">
            <textarea
              className="w-full h-32 p-4 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-white bg-transparent"
              value={answerResult || ""}
              readOnly
              aria-label="AI Feedback"
              style={{resize:'none'}}
            ></textarea>
          </div>

          {/* Law Question */}
          {questionStem && (
            <div className="w-full max-w-5xl mb-6 p-6 bg-white bg-opacity-20 backdrop-blur-md rounded-lg shadow-md overflow-y-scroll">
              <h3 className="text-2xl font-semibold text-white mb-2">Law Question</h3>
              <h3 className="text-sm font-medium text-gray-200 mb-6">LExAPI Version: 0.3.4</h3>

              <div className="text-gray-100 mb-4 whitespace-pre-wrap">
                {showHighlights && highlightedSections && highlightedSections.length > 0 ? (
                  highlightedSections.map((section, idx) =>
                    section.highlight ? (
                      <span
                        key={idx}
                        style={{ backgroundColor: highlightColor }}
                        title={section.reason}
                      >
                        {section.text}
                      </span>
                    ) : (
                      <span key={idx}>{section.text}</span>
                    )
                  )
                ) : (
                  <p>{questionStem}</p>
                )}
              </div>

              {/* Why These Areas Are Highlighted Section */}
              {showHighlights && highlightedReasons.length > 0 && (
                <div className="mt-4 p-4 bg-gray-900 bg-opacity-50 rounded">
                  <h4 className="text-lg text-blue-300 font-semibold mb-2">Why These Areas Are Highlighted</h4>
                  <ul className="list-disc list-inside text-gray-200">
                    {highlightedReasons.map((hr, i) => (
                      <li key={i}>
                        <span className="font-semibold">&quot;{hr.text.trim()}&quot;</span>: {hr.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Answer Input and Buttons */}
          {questionStem && currentQuestionCount < tutorConfig.questionLimit && (
            <div className="w-full max-w-5xl mb-6">
              {!answerResult && (
                <textarea
                  className={`w-full p-4 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-800'} rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your answer here..."
                  rows="6"
                  disabled={isLoading}
                  aria-label="Answer Input"
                ></textarea>
              )}

              <div className="flex space-x-4 mt-4">
                {!answerResult ? (
                  <button
                    onClick={handleSubmitAnswer}
                    className={`flex-1 px-4 py-3 rounded font-semibold text-white transition-colors duration-200 shadow-lg ${
                      isLoading || !inputText.trim()
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={isLoading || !inputText.trim()}
                    aria-label="Submit Answer"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Answer'}
                  </button>
                ) : (
                  <button
                    onClick={handleGetQuestion}
                    className="flex-1 px-4 py-3 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-lg"
                    disabled={isLoading}
                    aria-label="Continue to Next Question"
                  >
                    {isLoading ? 'Loading...' : 'Continue'}
                  </button>
                )}

                <button
                  onClick={handleSaveProgress}
                  className="flex items-center justify-center px-4 py-3 bg-transparent text-blue-300 rounded font-semibold duration-200 hover:text-blue-500"
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
                  className="flex items-center justify-center px-4 py-3 bg-transparent text-blue-300 rounded font-semibold duration-200 hover:text-blue-500"
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
            </div>
          )}

          {!questionStem && !questionText && (
            <div className="w-full max-w-5xl p-6 bg-white bg-opacity-20 backdrop-blur-md rounded-lg shadow-md text-center">
              <p className="text-gray-200 mb-4">
                Click <span className="font-semibold">Configure AI Tutor</span> to start.
              </p>
              <p className="text-gray-400 text-sm">
                <strong>Important Note:</strong> This AI Tutor helps you understand law topics by providing explanations, analyses, and feedback. It’s not a substitute for professional legal advice, but can guide you through reasoning steps, highlight key points, and reference principles to strengthen your legal acumen.
              </p>
            </div>
          )}

          {/* Configuration Modal */}
          {isConfigModalOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-800 p-8 rounded-lg w-11/12 max-w-md shadow-lg overflow-y-auto max-h-screen"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Configure AI Tutor</h2>
                <form>
                  {/* Prompt / Custom Input */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Custom Prompt or Topic (Optional):</label>
                    <input
                      type="text"
                      name="userPrompt"
                      value={tutorConfig.userPrompt}
                      onChange={handleConfigChange}
                      placeholder="e.g. 'Tort Law Basics'"
                      className="w-full p-3 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 bg-gray-700 text-white"
                      aria-label="Custom Prompt"
                    />
                  </div>

                  {/* Exam Type Selection */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Exam Type:</label>
                    <select
                      name="examType"
                      value={tutorConfig.examType}
                      onChange={handleConfigChange}
                      className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select Exam Type"
                    >
                      {Object.keys(examMapping).map((exam) => (
                        <option key={exam} value={exam}>
                          {exam}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Topic Selection */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Primary Topic:</label>
                    <select
                      name="topic"
                      value={tutorConfig.topic}
                      onChange={handleConfigChange}
                      className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select Primary Topic"
                    >
                      {topicOptions.map((topic, index) => (
                        <option key={index} value={topic.value}>
                          {topic.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-Topic Selection */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Sub-Topic:</label>
                    <select
                      name="subTopic"
                      value={tutorConfig.subTopic}
                      onChange={handleConfigChange}
                      className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select Sub-Topic"
                    >
                      {subTopicOptions.map((subTopic, index) => (
                        <option key={index} value={subTopic.value}>
                          {subTopic.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Complexity Level */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Complexity Level:</label>
                    <select
                      name="complexity"
                      value={tutorConfig.complexity}
                      onChange={handleConfigChange}
                      className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select Complexity Level"
                    >
                      {complexityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Helpful Features */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 font-semibold">
                      Additional Aids for Law Students:
                    </label>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="showLegalReferences"
                        name="showLegalReferences"
                        checked={tutorConfig.showLegalReferences}
                        onChange={handleConfigChange}
                        className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="showLegalReferences" className="ml-3 text-gray-300">
                        Show references to relevant legal principles
                      </label>
                    </div>

                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="provideApproach"
                        name="provideApproach"
                        checked={tutorConfig.provideApproach}
                        onChange={handleConfigChange}
                        className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="provideApproach" className="ml-3 text-gray-300">
                        Provide a structured approach to solving the problem
                      </label>
                    </div>

                    {/* Live Mode Checkbox */}
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="liveMode"
                        name="liveMode"
                        checked={tutorConfig.liveMode}
                        onChange={handleConfigChange}
                        className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="liveMode" className="ml-3 text-gray-300">
                        Live Mode (Show highlights before answering)
                      </label>
                    </div>
                  </div>

                  {/* Highlight Color Slider */}
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">
                      Highlight Color Hue:
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={tutorConfig.highlightHue}
                        onChange={(e) =>
                          setTutorConfig((prevConfig) => ({
                            ...prevConfig,
                            highlightHue: parseInt(e.target.value, 10),
                          }))
                        }
                        className="h-2 w-full bg-blue-400 rounded-lg appearance-none cursor-pointer"
                      />
                      <div
                        className="w-10 h-10 rounded"
                        style={{ backgroundColor: `hsl(${tutorConfig.highlightHue}, 100%, 50%)` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-2 text-gray-300">
                      Adjust the hue to change the highlight color. Default is neon yellow.
                    </p>
                  </div>

                  {/* Question Limit Slider */}
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">
                      Number of Questions per Session:
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={tutorConfig.questionLimit}
                        onChange={(e) =>
                          setTutorConfig((prevConfig) => ({
                            ...prevConfig,
                            questionLimit: parseInt(e.target.value, 10),
                          }))
                        }
                        className="w-full h-2 bg-blue-400 rounded-lg appearance-none cursor-pointer"
                        id="questionLimit"
                        aria-label="Set Number of Questions"
                      />
                      <span className="ml-4 text-gray-300">{tutorConfig.questionLimit}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleStartTutoringSession}
                      className="relative h-12 w-56 overflow-hidden rounded bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-colors duration-200"
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
                      className="px-6 py-3 bg-gray-600 text-gray-200 rounded hover:bg-gray-700 transition-colors duration-200"
                      aria-label="Cancel Configuration"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Final Feedback Modal */}
          {isFinalFeedbackModalOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-800 p-8 rounded-lg w-11/12 max-w-3xl shadow-lg max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Session Feedback</h2>
                <ul className="space-y-4">
                  {answeredQuestions.map((item, index) => (
                    <li key={index} className="p-4 border border-gray-700 rounded">
                      <p className="font-semibold text-blue-300 mb-2">
                        Question {index + 1}:
                      </p>
                      <p className="text-gray-200 mb-2">{item.question}</p>
                      <p className="text-gray-200 mb-1">
                        <span className="font-semibold">Your Answer:</span> {item.answer}
                      </p>
                      <p className="text-gray-200 mb-1">
                        <span className="font-semibold">Feedback:</span> {item.feedback}
                      </p>
                      <p
                        className={`font-semibold ${
                          item.correct ? 'text-emerald-400' : 'text-red-400'
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
                    className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
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
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[151]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-800 p-8 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Load Saved Progress</h2>
                {savedProgresses.length === 0 ? (
                  <p className="text-gray-200">No saved progresses found.</p>
                ) : (
                  <ul className="space-y-4">
                    {savedProgresses.map((progress) => (
                      <li key={progress.id} className="p-4 border border-gray-700 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-blue-300">
                              Exam Type: {progress.tutorConfig.examType}
                            </p>
                            <p className="text-sm text-gray-400">
                              Primary Topic: {progress.tutorConfig.topic}
                            </p>
                            <p className="text-sm text-gray-400">
                              Sub-Topic: {progress.tutorConfig.subTopic}
                            </p>
                            <p className="text-sm text-gray-400">
                              Complexity: {progress.tutorConfig.complexity}
                            </p>
                            <p className="text-sm text-gray-400">
                              Questions Set: {progress.tutorConfig.questionLimit}
                            </p>
                            <p className="text-sm text-gray-400">
                              Current Question: {progress.currentQuestionCount}
                            </p>
                            <p className="text-sm text-gray-400">
                              Saved on: {new Date(progress.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleLoadProgress(progress)}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
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
                    className="px-6 py-3 bg-gray-600 text-gray-200 rounded hover:bg-gray-700 transition-colors duration-200"
                    aria-label="Close Load Progress Modal"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
