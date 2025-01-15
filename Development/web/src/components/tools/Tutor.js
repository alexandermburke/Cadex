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

// ----------------------------------------
// 1. STUDY MAPPING FOR LAW SCHOOL
// ----------------------------------------
const studyMapping = {
  '1L': {
    topics: [
      { value: 'Contracts', label: 'Contracts' },
      { value: 'Torts', label: 'Torts' },
      { value: 'Civil Procedure', label: 'Civil Procedure' },
    ],
    subTopics: {
      'Contracts': [
        { value: 'Formation', label: 'Formation' },
        { value: 'Performance', label: 'Performance' },
        { value: 'Remedies', label: 'Remedies' },
      ],
      'Torts': [
        { value: 'Negligence', label: 'Negligence' },
        { value: 'Intentional Torts', label: 'Intentional Torts' },
        { value: 'Strict Liability', label: 'Strict Liability' },
      ],
      'Civil Procedure': [
        { value: 'Jurisdiction', label: 'Jurisdiction' },
        { value: 'Pleadings', label: 'Pleadings' },
        { value: 'Discovery', label: 'Discovery' },
      ],
    },
  },
  '2L': {
    topics: [
      { value: 'Criminal Law', label: 'Criminal Law' },
      { value: 'Evidence', label: 'Evidence' },
      { value: 'Property', label: 'Property' },
    ],
    subTopics: {
      'Criminal Law': [
        { value: 'Homicide', label: 'Homicide' },
        { value: 'Inchoate Offenses', label: 'Inchoate Offenses' },
        { value: 'Defenses', label: 'Defenses' },
      ],
      'Evidence': [
        { value: 'Relevance', label: 'Relevance' },
        { value: 'Hearsay', label: 'Hearsay' },
        { value: 'Privileges', label: 'Privileges' },
      ],
      'Property': [
        { value: 'Estates in Land', label: 'Estates in Land' },
        { value: 'Landlord-Tenant', label: 'Landlord-Tenant' },
        { value: 'Future Interests', label: 'Future Interests' },
      ],
    },
  },
  '3L': {
    topics: [
      { value: 'Constitutional Law', label: 'Constitutional Law' },
      { value: 'Family Law', label: 'Family Law' },
      { value: 'Wills & Trusts', label: 'Wills & Trusts' },
      { value: 'Business Associations', label: 'Business Associations' },
    ],
    subTopics: {
      'Constitutional Law': [
        { value: 'Equal Protection', label: 'Equal Protection' },
        { value: 'Due Process', label: 'Due Process' },
        { value: 'First Amendment', label: 'First Amendment' },
      ],
      'Family Law': [
        { value: 'Marriage & Divorce', label: 'Marriage & Divorce' },
        { value: 'Child Custody', label: 'Child Custody' },
        { value: 'Alimony & Child Support', label: 'Alimony & Child Support' },
      ],
      'Wills & Trusts': [
        { value: 'Intestacy', label: 'Intestacy' },
        { value: 'Trust Formation', label: 'Trust Formation' },
        { value: 'Will Formalities', label: 'Will Formalities' },
      ],
      'Business Associations': [
        { value: 'Corporations', label: 'Corporations' },
        { value: 'Partnerships', label: 'Partnerships' },
        { value: 'LLCs', label: 'LLCs' },
      ],
    },
  },
  'LLM': {
    topics: [
      { value: 'International Law', label: 'International Law' },
      { value: 'Tax Law', label: 'Tax Law' },
    ],
    subTopics: {
      'International Law': [
        { value: 'Treaties', label: 'Treaties' },
        { value: 'Jurisdiction Issues', label: 'Jurisdiction Issues' },
        { value: 'International Dispute Resolution', label: 'International Dispute Resolution' },
      ],
      'Tax Law': [
        { value: 'Individual Taxation', label: 'Individual Taxation' },
        { value: 'Corporate Taxation', label: 'Corporate Taxation' },
        { value: 'Tax Procedure', label: 'Tax Procedure' },
      ],
    },
  },
};

// ----------------------------------------
export default function AiTutor() {
  const { currentUser, userDataObj } = useAuth();
  const router = useRouter();

  const isDarkMode = userDataObj?.darkMode || false;

  // User session states
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

  // ----------------------------------------
  // 2. TUTOR CONFIG FOR LAW SCHOOL
  // ----------------------------------------
  const [tutorConfig, setTutorConfig] = useState({
    studyYear: '1L',              // e.g. '1L', '2L', '3L', 'LLM'
    course: 'Contracts',          // e.g. 'Contracts', 'Torts'
    subTopic: 'Formation',        // e.g. 'Formation', 'Performance'
    complexity: 'Intermediate',   // Basic, Intermediate, Advanced, Expert
    questionLimit: 5,
    userPrompt: '',
    showLegalReferences: true,
    provideApproach: true,
    liveMode: false,
    highlightHue: 60,
    highlightOpacity: 0.6,
    // New checkboxes for law students
    includeKeyCases: false,
    includeStatutes: false,
  });

  // Complexity options
  const complexityOptions = [
    { value: 'Basic', label: 'Basic' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
  ];

  // Build out dynamic options
  const [topicOptions, setTopicOptions] = useState(studyMapping['1L'].topics);
  const [subTopicOptions, setSubTopicOptions] = useState(
    studyMapping['1L'].subTopics['Contracts'] || []
  );

  // Canvas Visualizer Ref
  const visualizerCanvas = useRef(null);
  const animationFrameId = useRef(null);

  // Refs for Line Animation
  const linesRef = useRef([]);
  const frameRef = useRef(0);
  const gradientRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // Refs for Central Exclusion Area
  const centerRef = useRef({ x: 0, y: 0 });
  const radiusRef = useRef(200);

  // -------------------------------
  // 3. UseEffect: Update topic/subTopic on studyYear changes
  // -------------------------------
  useEffect(() => {
    const selectedYear = tutorConfig.studyYear;
    const yearMapping = studyMapping[selectedYear];

    if (!yearMapping) {
      console.error(`Invalid studyYear: ${selectedYear}`);
      // Optionally, reset to default
      setTutorConfig((prevConfig) => ({
        ...prevConfig,
        studyYear: '1L',
      }));
      return;
    }

    const newTopicOptions = yearMapping.topics || [];
    const firstTopic = newTopicOptions[0]?.value || '';

    const newSubTopicOptions =
      yearMapping.subTopics[firstTopic] || [];

    setTopicOptions(newTopicOptions);
    setSubTopicOptions(newSubTopicOptions);

    setTutorConfig((prevConfig) => ({
      ...prevConfig,
      course: firstTopic, // e.g. 'Contracts'
      subTopic: newSubTopicOptions[0]?.value || '',
    }));
  }, [tutorConfig.studyYear]);

  useEffect(() => {
    const selectedYear = tutorConfig.studyYear;
    const yearMapping = studyMapping[selectedYear];

    if (!yearMapping) {
      console.error(`Invalid studyYear: ${selectedYear}`);
      return;
    }

    const selectedCourse = tutorConfig.course;
    const newSubTopicOptions =
      yearMapping.subTopics[selectedCourse] || [];

    setSubTopicOptions(newSubTopicOptions);

    setTutorConfig((prevConfig) => ({
      ...prevConfig,
      subTopic: newSubTopicOptions[0]?.value || '',
    }));
  }, [tutorConfig.course, tutorConfig.studyYear]);

  // -------------------------------
  // 4. Line Animation Visualizer
  // -------------------------------
  useEffect(() => {
    const canvas = visualizerCanvas.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const scale = window.devicePixelRatio || 1;

    // Line Class Definition
    class Line {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.path = [];
        this.pathLength = 0;
        this.angle = 0;
        this.speed = random(0.5, 2);
        this.target = { x: x + 0.1, y: y + 0.1 };
        this.thickness = Math.round(random(0.5, 3));
        this.maxLength = Math.round(random(100, 350));
        this.hasShadow = this.thickness > 2;
        this.decay = random(0.0075, 0.05);
        this.alpha = 1;
      }

      step() {
        if (this.pathLength >= this.maxLength) {
          this.alpha -= this.decay;
          return;
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        let isAnchor = false;
        const target = this.target;
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
          isAnchor = true;
          this.x = target.x;
          this.y = target.y;
          this.steer();
        }

        this.path.push({
          x: this.x,
          y: this.y,
          isAnchor: isAnchor,
        });

        this.pathLength++;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.lineWidth = this.thickness;

        ctx.beginPath();

        if (this.hasShadow) {
          ctx.shadowOffsetX = 10;
          ctx.shadowOffsetY = 20;
          ctx.shadowBlur = 12;
          ctx.shadowColor = 'rgba(0,0,0,0.09)';
        }

        this.path.forEach(function (point, i) {
          ctx[i === 0 ? 'moveTo' : 'lineTo'](point.x, point.y);
        });

        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.path[0].x, this.path[0].y, 4, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      steer() {
        const distance = random(50, 200);
        const angleOptions = [-HALF_PI, 0, HALF_PI, -Math.PI];
        const angle = random(angleOptions);

        // Squash all non-anchor points to squeeze out some extra performance
        this.path = this.path.filter(function (point) {
          return point.isAnchor === true;
        });

        this.target.x = this.x + Math.cos(angle) * distance;
        this.target.y = this.y + Math.sin(angle) * distance;
        this.angle = angle;
      }
    }

    // Helper Functions
    function random(min, max) {
      if (arguments.length === 0) return Math.random();
      if (Array.isArray(min)) return min[Math.floor(Math.random() * min.length)];
      if (typeof min === 'undefined') min = 1;
      if (typeof max === 'undefined') {
        max = min || 1;
        min = 0;
      }
      return min + Math.random() * (max - min);
    }

    function getRandomPointOutsideCircle(center, radius, xRange, yRange) {
      let x, y, dx, dy, distanceSquared;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        x = random(xRange.min, xRange.max);
        y = random(yRange.min, yRange.max);
        dx = x - center.x;
        dy = y - center.y;
        distanceSquared = dx * dx + dy * dy;
        attempts++;

        if (attempts > maxAttempts) {
          // Fallback to a point on the perimeter
          const angle = random(0, TWO_PI);
          x = center.x + radius * Math.cos(angle);
          y = center.y + radius * Math.sin(angle);
          break;
        }
      } while (distanceSquared < radius * radius);

      return { x, y };
    }

    const TWO_PI = Math.PI * 2;
    const HALF_PI = Math.PI / 2;

    // Initialize Canvas
    function resizeCanvas() {
      const parent = canvas.parentElement;
      if (!parent) return;

      const width = parent.clientWidth;
      const height = parent.clientHeight;

      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // Update center and radius
      centerRef.current = { x: width / 2, y: height / 2 };
      radiusRef.current = 250; // Adjust as needed

      // Create gradient
      gradientRef.current = ctx.createLinearGradient(width * 0.25, 0, width * 0.75, 0);
      gradientRef.current.addColorStop(0, '#ffffff'); // Start color
      gradientRef.current.addColorStop(1, '#ffffff'); // End color
    }

    // Animation Loop
    function drawFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.strokeStyle = gradientRef.current;
      ctx.fillStyle = '#F7FAFB';

      // Update and Draw Lines
      linesRef.current = linesRef.current.filter(function (line) {
        line.step();
        return line.alpha > 0.01;
      });

      linesRef.current.forEach(function (line) {
        line.draw();
      });

      // Add New Lines at Intervals
      if (frameRef.current % 12 === 0) {
        const center = centerRef.current;
        const radius = radiusRef.current;
        const xRange = { min: 0, max: canvas.width };
        const yRange = { min: 0, max: canvas.height };

        const { x, y } = getRandomPointOutsideCircle(center, radius, xRange, yRange);
        linesRef.current.push(new Line(x, y));
      }

      frameRef.current++;
      animationFrameId.current = requestAnimationFrame(drawFrame);
    }

    // Initialize
    resizeCanvas();
    drawFrame();

    // Handle Resize
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on Unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  // --------------------------------------
  // 5. Handlers: get question, submit answer, etc.
  // --------------------------------------
  const handleGetQuestion = async () => {
    setIsLoading(true);
    setIsCommunicating(true);
    setQuestionText('');
    setQuestionStem('');
    setHighlightedSections([]);
    setAnswerResult('');
    setInputText('');

    try {
      // POST to /api/tutor/get-ai-question but now for law students
      const response = await fetch('/api/tutor/get-ai-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tutorConfig),
      });

      if (!response.ok) throw new Error('Failed to get AI question');

      const { question, highlightedSections } = await response.json();

      if (!question) {
        throw new Error('No question received from AI.');
      }

      setHighlightedSections(highlightedSections || []);
      setQuestionStem(question);
      setQuestionText(question);
      setIsSessionActive(true);
    } catch (error) {
      console.error('Error fetching AI question:', error);
      setQuestionText('An error occurred while fetching the question.');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          answer: inputText,
          studyYear: tutorConfig.studyYear,
          course: tutorConfig.course,
          subTopic: tutorConfig.subTopic,
          showLegalReferences: tutorConfig.showLegalReferences,
          provideApproach: tutorConfig.provideApproach,
          includeKeyCases: tutorConfig.includeKeyCases,
          includeStatutes: tutorConfig.includeStatutes,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      const { feedback, correct, highlightedSections: newHighlights } = await response.json();

      const feedbackText = feedback !== undefined ? feedback : 'No feedback provided.';
      const isCorrect = typeof correct === 'boolean' ? correct : false;

      setAnswerResult(feedbackText);

      if (newHighlights && newHighlights.length > 0) {
        setHighlightedSections(newHighlights);
      }

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
    } catch (error) {
      console.error('Error submitting answer:', error);
      setAnswerResult('An error occurred while submitting your answer.');
    } finally {
      setIsLoading(false);
      setIsCommunicating(false);
    }
  };

  // If we exceed the questionLimit
  useEffect(() => {
    if (currentQuestionCount >= tutorConfig.questionLimit && questionText !== '') {
      setCurrentQuestionCount(0);
      openFinalFeedbackModal();
    }
  }, [currentQuestionCount, tutorConfig.questionLimit, questionText]);

  // --------------------------------------
  // 6. Configuration & Modal Handling
  // --------------------------------------
  const openConfigModal = () => setIsConfigModalOpen(true);
  const closeConfigModal = () => setIsConfigModalOpen(false);

  const openLoadProgressModal = () => {
    fetchSavedProgresses();
    setIsLoadProgressModalOpen(true);
  };
  const closeLoadProgressModal = () => setIsLoadProgressModalOpen(false);

  const openFinalFeedbackModal = () => setIsFinalFeedbackModalOpen(true);
  const closeFinalFeedbackModal = () => setIsFinalFeedbackModalOpen(false);

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

  // --------------------------------------
  // 7. Saving & Loading Progress
  // --------------------------------------
  const handleSaveProgress = async () => {
    if (!currentUser) {
      alert('You need to be logged in to save your progress.');
      return;
    }
    try {
      const progressData = {
        userId: currentUser.uid,
        tutorConfig: { ...tutorConfig },
        questionText: questionText || '',
        inputText: inputText || '',
        answerResult: answerResult || '',
        currentQuestionCount: currentQuestionCount || 0,
        answeredQuestions: answeredQuestions.map((q) => ({
          question: q.question || '',
          answer: q.answer || '',
          feedback: q.feedback || '',
          correct: q.correct || false,
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
      alert('You need to be logged in to load progress.');
      return;
    }
    try {
      const qQuery = query(collection(db, 'tutorProgress'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(qQuery);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      setSavedProgresses(results);
    } catch (error) {
      console.error('Error fetching saved progresses:', error);
      alert('An error occurred while fetching saved progresses.');
    }
  };

  const handleLoadProgress = (progress) => {
    // Validate studyYear before loading
    if (!studyMapping[progress.tutorConfig.studyYear]) {
      alert(`Invalid studyYear "${progress.tutorConfig.studyYear}" in saved progress. Resetting to default.`);
      setTutorConfig((prevConfig) => ({
        ...prevConfig,
        studyYear: '1L',
      }));
      closeLoadProgressModal();
      return;
    }

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
      alert('You need to be logged in to delete progress.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'tutorProgress', id));
      fetchSavedProgresses();
    } catch (error) {
      console.error('Error deleting progress:', error);
      alert('An error occurred while deleting progress.');
    }
  };

  // --------------------------------------
  // 8. Access Control
  // --------------------------------------
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
    return 'LExAPI Version 3.6';
  }

  const highlightedReasons = highlightedSections
    .filter((section) => section.highlight && section.reason && section.reason !== 'Not crucial')
    .map((section) => ({ text: section.text, reason: section.reason }));

  const showHighlights = tutorConfig.liveMode || answerResult;
  const highlightColor = `hsla(${tutorConfig.highlightHue}, 100%, 50%, ${tutorConfig.highlightOpacity})`;

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 to-blue-800 rounded shadow-md z-[150]">
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/lexapi"
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

      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 overflow-auto">
        {/* Header */}
        <div className="w-full max-w-5xl flex flex-row flex-nowrap items-center justify-between gap-2 sm:gap-4 mb-10 sm:mb-20">
          {/* Sidebar Toggle */}
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

          {/* Load Progress & Configure */}
          <div className="inline-flex flex-row flex-nowrap items-center gap-2 sm:gap-4">
            <button
              onClick={openLoadProgressModal}
              className="relative h-10 sm:h-12 w-28 sm:w-40 overflow-hidden rounded bg-blue-700 text-white shadow-lg transition-colors duration-200 
                         before:absolute before:right-0 before:top-0 before:h-full before:w-5 
                         before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 
                         before:duration-700 hover:before:-translate-x-56 text-sm sm:text-base"
              aria-label="Load Progress"
            >
              Load Progress
            </button>
            <button
              onClick={openConfigModal}
              className="relative h-10 sm:h-12 w-28 sm:w-40 overflow-hidden rounded bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg transition-colors duration-200 
                         before:absolute before:right-0 before:top-0 before:h-full before:w-5 
                         before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 
                         before:duration-700 hover:before:-translate-x-56 text-sm sm:text-base"
              aria-label="Configure AI Tutor"
            >
              Configure
            </button>
          </div>
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

        {/* Visualizer & Feedback */}
        <div className="w-full max-w-5xl flex flex-col items-center">
          {/* Visualizer Container */}
          <AnimatePresence>
            {!isSessionActive && (
              <motion.div
                className="relative w-full h-64 sm:h-80 md:h-96 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <canvas
                  ref={visualizerCanvas}
                  className="absolute top-0 left-0 w-full h-full rounded"
                  aria-label="Background Animation Canvas"
                ></canvas>
                <div className="absolute inset-0 flex items-center justify-center">
                  <textarea
                    className="w-48 sm:w-64 h-24 bg-transparent text-center p-2 rounded-md focus:outline-none 
                               focus:ring-2 focus:ring-blue-500 text-white font-semibold text-2xl"
                    value={messageDisplay()}
                    readOnly
                    aria-label="AI Communication Status"
                    style={{ resize: 'none' }}
                  ></textarea>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Textbox */}
          <div className="w-full max-w-5xl mb-6">
            <textarea
              className="w-full h-48 p-4 rounded resize-none focus:outline-none focus:ring-2 
                         focus:ring-blue-500 transition-colors duration-200 text-white bg-transparent"
              value={answerResult || ''}
              readOnly
              aria-label="AI Feedback"
              style={{ resize: 'none' }}
            ></textarea>
          </div>

          {/* Law Question */}
          {questionStem && (
            <div className="w-full max-w-5xl mb-6 p-6 bg-white bg-opacity-20 backdrop-blur-md rounded-lg shadow-md overflow-y-scroll">
              <h3 className="text-2xl font-semibold text-white mb-2">Law Question</h3>
              <h3 className="text-sm font-medium text-gray-200 mb-6">LExAPI Version: 0.3.6</h3>
              <div className="text-gray-100 mb-4 whitespace-pre-wrap">
                {showHighlights && highlightedSections && highlightedSections.length > 0 ? (
                  highlightedSections.map((section, idx) =>
                    section.highlight ? (
                      <motion.span
                        key={idx}
                        style={{
                          backgroundColor: highlightColor,
                          display: 'inline-block',
                          transformOrigin: 'left center',
                        }}
                        title={section.reason}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1 }}
                      >
                        {section.text}
                      </motion.span>
                    ) : (
                      <span key={idx}>{section.text}</span>
                    )
                  )
                ) : (
                  <p>{questionStem}</p>
                )}
              </div>

              {/* Why These Areas Are Highlighted */}
              {showHighlights && highlightedReasons.length > 0 && (
                <div className="mt-4 p-4 bg-gray-900 bg-opacity-50 rounded">
                  <h4 className="text-lg text-blue-300 font-semibold mb-2">
                    Why These Areas Are Highlighted
                  </h4>
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
                  className={`w-full p-4 border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-800'
                  } rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                             transition-colors duration-200`}
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
                  <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.5 }}>
                    <FaSave size={24} />
                  </motion.div>
                </button>
                <button
                  onClick={handleGetQuestion}
                  className="flex items-center justify-center px-4 py-3 bg-transparent text-blue-300 rounded font-semibold duration-200 hover:text-blue-500"
                  disabled={isLoading}
                  aria-label="Generate New Question"
                >
                  <motion.div whileHover={{ scale: 1.2, rotate: -360 }} transition={{ duration: 0.5 }}>
                    <FaSyncAlt size={24} />
                  </motion.div>
                </button>
              </div>
            </div>
          )}

          {/* Initial welcome area (no question loaded) */}
          {!questionStem && !questionText && (
            <div className="w-full max-w-5xl p-6 bg-white bg-opacity-20 backdrop-blur-md rounded-lg shadow-md text-center">
              <p className="text-gray-200 mb-4">
                Click <span className="font-semibold">Configure AI Tutor</span> to start.
              </p>
              <p className="text-gray-400 text-sm">
                <strong>Note:</strong> This AI Tutor helps you practice law school concepts, 
                offers structured feedback, and references key principles or statutes. 
                It’s not a substitute for professional legal advice.
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
                  {/* Custom Prompt */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Custom Prompt / Topic (Optional):</label>
                    <input
                      type="text"
                      name="userPrompt"
                      value={tutorConfig.userPrompt}
                      onChange={handleConfigChange}
                      placeholder="e.g. 'Negligence in Torts' or 'Offer & Acceptance'"
                      className="w-full p-3 border border-gray-500 rounded focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 transition-colors duration-200 
                                 bg-gray-700 text-white"
                      aria-label="Custom Prompt"
                    />
                  </div>

                  {/* Study Year */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Law School Year:</label>
                    <select
                      name="studyYear"
                      value={tutorConfig.studyYear}
                      onChange={handleConfigChange}
                      className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white 
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select Law School Year"
                    >
                      {Object.keys(studyMapping).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Course:</label>
                    <select
                      name="course"
                      value={tutorConfig.course}
                      onChange={handleConfigChange}
                      className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white 
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select Course"
                    >
                      {topicOptions.map((t, idx) => (
                        <option key={idx} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-Topic */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Sub-Topic:</label>
                    <select
                      name="subTopic"
                      value={tutorConfig.subTopic}
                      onChange={handleConfigChange}
                      className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white 
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select Sub-topic"
                    >
                      {subTopicOptions.map((sub, idx) => (
                        <option key={idx} value={sub.value}>
                          {sub.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Complexity */}
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Complexity Level:</label>
                    <select
                      name="complexity"
                      value={tutorConfig.complexity}
                      onChange={handleConfigChange}
                      className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white 
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Select Complexity"
                    >
                      {complexityOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Aids */}
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

                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="includeKeyCases"
                        name="includeKeyCases"
                        checked={tutorConfig.includeKeyCases}
                        onChange={handleConfigChange}
                        className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="includeKeyCases" className="ml-3 text-gray-300">
                        Include references to key cases
                      </label>
                    </div>

                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="includeStatutes"
                        name="includeStatutes"
                        checked={tutorConfig.includeStatutes}
                        onChange={handleConfigChange}
                        className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="includeStatutes" className="ml-3 text-gray-300">
                        Include relevant statutes or code sections
                      </label>
                    </div>

                    {/* Live Mode */}
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
                    <label className="block text-gray-300 mb-2">Highlight Color Hue:</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={tutorConfig.highlightHue}
                        onChange={(e) =>
                          setTutorConfig((prev) => ({
                            ...prev,
                            highlightHue: parseInt(e.target.value, 10),
                          }))
                        }
                        className="h-2 w-full bg-blue-400 rounded-lg appearance-none cursor-pointer"
                      />
                      <div
                        className="w-10 h-10 rounded"
                        style={{
                          backgroundColor: `hsl(${tutorConfig.highlightHue}, 100%, 50%)`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm mt-2 text-gray-300">
                      Adjust the hue to change the highlight color (default is neon yellow).
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
                          setTutorConfig((prev) => ({
                            ...prev,
                            questionLimit: parseInt(e.target.value, 10),
                          }))
                        }
                        className="w-full h-2 bg-blue-400 rounded-lg appearance-none cursor-pointer"
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
                      className="relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg transition-colors duration-200 
                                 before:absolute before:right-0 before:top-0 before:h-12 before:w-5 
                                 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-20 
                                 before:duration-700 hover:before:-translate-x-56"
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
                      <p className="font-semibold text-blue-300">Question {index + 1}:</p>
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
                  <p className="text-gray-200">No saved progress found.</p>
                ) : (
                  <ul className="space-y-4">
                    {savedProgresses.map((progress) => (
                      <li key={progress.id} className="p-4 border border-gray-700 rounded">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                          <div>
                            <p className="font-semibold text-blue-300">
                              Law Year: {progress.tutorConfig?.studyYear}
                            </p>
                            <p className="text-sm text-gray-400">
                              Course: {progress.tutorConfig?.course}
                            </p>
                            <p className="text-sm text-gray-400">
                              Sub-Topic: {progress.tutorConfig?.subTopic}
                            </p>
                            <p className="text-sm text-gray-400">
                              Complexity: {progress.tutorConfig?.complexity}
                            </p>
                            <p className="text-sm text-gray-400">
                              Questions: {progress.tutorConfig?.questionLimit}
                            </p>
                            <p className="text-sm text-gray-400">
                              Current Question: {progress.currentQuestionCount}
                            </p>
                            <p className="text-sm text-gray-400">
                              Saved on: {new Date(progress.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2 mt-2 sm:mt-0">
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
