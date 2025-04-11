'use client';
import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { doc, collection, addDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { FaSave, FaSyncAlt, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const studyMapping = {
  '1L': {
    topics: [
      { value: 'Contracts', label: 'Contracts' },
      { value: 'Torts', label: 'Torts' },
      { value: 'Civil Procedure', label: 'Civil Procedure' },
    ],
    subTopics: {
      Contracts: [
        { value: 'Formation', label: 'Formation' },
        { value: 'Performance', label: 'Performance' },
        { value: 'Remedies', label: 'Remedies' },
      ],
      Torts: [
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
      Evidence: [
        { value: 'Relevance', label: 'Relevance' },
        { value: 'Hearsay', label: 'Hearsay' },
        { value: 'Privileges', label: 'Privileges' },
      ],
      Property: [
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
  LLM: {
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

export default function AiTutor() {
  const { currentUser, userDataObj } = useAuth();
  const router = useRouter();
  const isDarkMode = userDataObj?.darkMode || false;
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);
  const [inputText, setInputText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionStem, setQuestionStem] = useState('');
  const [highlightedSections, setHighlightedSections] = useState([]);
  const [answerResult, setAnswerResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCommunicating, setIsCommunicating] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentQuestionCount, setCurrentQuestionCount] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [isFinalFeedbackModalOpen, setIsFinalFeedbackModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);
  const [tutorConfig, setTutorConfig] = useState({
    studyYear: '1L',
    course: 'Contracts',
    subTopic: 'Formation',
    complexity: 'Intermediate',
    questionLimit: 5,
    userPrompt: '',
    showLegalReferences: true,
    provideApproach: true,
    liveMode: false,
    highlightHue: 60,
    highlightOpacity: 0.6,
    includeKeyCases: false,
    includeStatutes: false,
  });
  const complexityOptions = [
    { value: 'Basic', label: 'Basic' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
  ];
  const [topicOptions, setTopicOptions] = useState(studyMapping['1L'].topics);
  const [subTopicOptions, setSubTopicOptions] = useState(studyMapping['1L'].subTopics['Contracts']);
  const visualizerCanvas = useRef(null);
  const animationFrameId = useRef(null);
  const linesRef = useRef([]);
  const frameRef = useRef(0);
  const gradientRef = useRef(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const radiusRef = useRef(200);

  useEffect(() => {
    const selectedYear = tutorConfig.studyYear;
    const yearMapping = studyMapping[selectedYear];
    if (!yearMapping) return;
    const newTopicOptions = yearMapping.topics || [];
    const firstTopic = newTopicOptions[0]?.value || '';
    const newSubTopicOptions = yearMapping.subTopics[firstTopic] || [];
    setTopicOptions(newTopicOptions);
    setSubTopicOptions(newSubTopicOptions);
    setTutorConfig((prev) => ({
      ...prev,
      course: firstTopic,
      subTopic: newSubTopicOptions[0]?.value || '',
    }));
  }, [tutorConfig.studyYear]);

  useEffect(() => {
    const yearMapping = studyMapping[tutorConfig.studyYear];
    if (!yearMapping) return;
    const selectedCourse = tutorConfig.course;
    const newSubTopicOptions = yearMapping.subTopics[selectedCourse] || [];
    setSubTopicOptions(newSubTopicOptions);
    setTutorConfig((prev) => ({
      ...prev,
      subTopic: newSubTopicOptions[0]?.value || '',
    }));
  }, [tutorConfig.course, tutorConfig.studyYear]);

  useEffect(() => {
    if (currentQuestionCount >= tutorConfig.questionLimit && questionText !== '') {
      setCurrentQuestionCount(0);
      openFinalFeedbackModal();
    }
  }, [currentQuestionCount, tutorConfig.questionLimit, questionText]);

  useEffect(() => {
    const canvas = visualizerCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scale = window.devicePixelRatio || 1;
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
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.speed) {
          isAnchor = true;
          this.x = this.target.x;
          this.y = this.target.y;
          this.steer();
        }
        this.path.push({ x: this.x, y: this.y, isAnchor });
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
        this.path.forEach((pt, i) => {
          ctx[i === 0 ? 'moveTo' : 'lineTo'](pt.x, pt.y);
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
        this.path = this.path.filter((p) => p.isAnchor === true);
        this.target.x = this.x + Math.cos(angle) * distance;
        this.target.y = this.y + Math.sin(angle) * distance;
        this.angle = angle;
      }
    }
    const TWO_PI = Math.PI * 2;
    const HALF_PI = Math.PI / 2;
    function random(min, max) {
      if (arguments.length === 0) return Math.random();
      if (Array.isArray(min)) return min[Math.floor(Math.random() * min.length)];
      if (typeof min === 'undefined') min = 1;
      if (typeof max === 'undefined') {
        max = min;
        min = 0;
      }
      return min + Math.random() * (max - min);
    }
    function getRandomPointOutsideCircle(center, radius, xRange, yRange) {
      let x, y, dx, dy, distSq;
      let attempts = 0;
      const maxAttempts = 100;
      do {
        x = random(xRange.min, xRange.max);
        y = random(yRange.min, yRange.max);
        dx = x - center.x;
        dy = y - center.y;
        distSq = dx * dx + dy * dy;
        attempts++;
        if (attempts > maxAttempts) {
          const angle = random(0, TWO_PI);
          x = center.x + radius * Math.cos(angle);
          y = center.y + radius * Math.sin(angle);
          break;
        }
      } while (distSq < radius * radius);
      return { x, y };
    }
    function resizeCanvas() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);
      centerRef.current = { x: width / 2, y: height / 2 };
      radiusRef.current = 165;
      gradientRef.current = ctx.createLinearGradient(width * 0.25, 0, width * 0.75, 0);
      gradientRef.current.addColorStop(0, '#ffffff');
      gradientRef.current.addColorStop(1, '#ffffff');
    }
    function drawFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.strokeStyle = gradientRef.current;
      ctx.fillStyle = '#F7FAFB';
      linesRef.current = linesRef.current.filter((line) => {
        line.step();
        return line.alpha > 0.01;
      });
      linesRef.current.forEach((line) => line.draw());
      if (frameRef.current % 24 === 0) {
        const { x, y } = getRandomPointOutsideCircle(
          centerRef.current,
          radiusRef.current,
          { min: 0, max: canvas.width },
          { min: 0, max: canvas.height }
        );
        linesRef.current.push(new Line(x, y));
      }
      frameRef.current++;
      animationFrameId.current = requestAnimationFrame(drawFrame);
    }
    resizeCanvas();
    drawFrame();
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded shadow-md">
          <p className="text-gray-700 mb-4">
            Please <a href="/login" className="text-blue-900 underline">log in</a> to use the AI Law Tutor.
          </p>
          <button onClick={() => router.push('/login')} className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-700">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTutorConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openConfigModal = () => setIsConfigModalOpen(true);
  const closeConfigModal = () => setIsConfigModalOpen(false);
  const openLoadProgressModal = () => {
    fetchSavedProgresses();
    setIsLoadProgressModalOpen(true);
  };
  const closeLoadProgressModal = () => setIsLoadProgressModalOpen(false);
  const openFinalFeedbackModal = () => setIsFinalFeedbackModalOpen(true);
  const closeFinalFeedbackModal = () => setIsFinalFeedbackModalOpen(false);
  const handleStartTutoringSession = () => {
    closeConfigModal();
    handleGetQuestion();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tutorConfig),
      });
      if (!response.ok) throw new Error('Failed to get AI question');
      const { question, highlightedSections } = await response.json();
      if (!question) throw new Error('No question received from AI.');
      setHighlightedSections(highlightedSections || []);
      setQuestionStem(question);
      setQuestionText(question);
      setIsSessionActive(true);
    } catch (err) {
      console.error('Error fetching AI question:', err);
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
      if (newHighlights?.length) setHighlightedSections(newHighlights);
      setAnsweredQuestions((prev) => [
        ...prev,
        {
          question: questionText || 'No question text provided.',
          answer: inputText || 'No answer provided.',
          feedback: feedbackText,
          correct: isCorrect,
        },
      ]);
      setCurrentQuestionCount((c) => c + 1);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setAnswerResult('An error occurred while submitting your answer.');
    } finally {
      setIsLoading(false);
      setIsCommunicating(false);
    }
  };
  const handleSaveProgress = async () => {
    if (!currentUser) {
      alert('You need to be logged in to save your progress.');
      return;
    }
    try {
      const docData = {
        userId: currentUser.uid,
        tutorConfig: { ...tutorConfig },
        questionText: questionText || '',
        inputText: inputText || '',
        answerResult: answerResult || '',
        currentQuestionCount,
        answeredQuestions: answeredQuestions.map((q) => ({ ...q })),
        timestamp: new Date().toISOString(),
      };
      await addDoc(collection(db, 'tutorProgress'), docData);
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
      const qQuery = query(collection(db, 'tutorProgress'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(qQuery);
      const loaded = [];
      snap.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSavedProgresses(loaded);
    } catch (err) {
      console.error('Error fetching saved progress:', err);
      alert('Error fetching saved progresses.');
    }
  };
  const handleLoadProgress = (progress) => {
    if (!studyMapping[progress.tutorConfig.studyYear]) {
      alert(`Invalid studyYear "${progress.tutorConfig.studyYear}" in saved progress. Resetting to default.`);
      progress.tutorConfig.studyYear = '1L';
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
      alert('You need to be logged in to delete your progress.');
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
  const isProUser = userDataObj?.billing?.plan === 'Pro' || userDataObj?.billing?.plan === 'Developer';
  const showHighlights = tutorConfig.liveMode || answerResult;
  const highlightedReasons = highlightedSections
    .filter((s) => s.highlight && s.reason && s.reason !== 'Not crucial')
    .map((s) => ({ text: s.text, reason: s.reason }));

  return (
    <div className={clsx(
      'flex h-screen bg-transparent rounded shadow-md z-[150] relative',
      isDarkMode && 'dark'
    )}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/lexapi"
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
              isDarkMode={isDarkMode}
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
      <div className="absolute top-6 left-4 z-[100] md:hidden">
        <button
          onClick={toggleSidebar}
          className={clsx('text-blue-900 dark:text-white p-2 rounded transition-colors hover:bg-black/10 focus:outline-none')}
          aria-label={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isSidebarVisible ? (
              <motion.div key="close-icon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.3 }}>
                <FaTimes size={20} />
              </motion.div>
            ) : (
              <motion.div key="bars-icon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.3 }}>
                <FaBars size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
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
          <span className="text-xs mt-1 dark:text-gray-300">Load</span>
        </div>
        <div className="flex flex-col items-center">
          <motion.button
            onClick={openConfigModal}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white transition-all duration-200 shadow-lg"
            aria-label="Configure Tutor"
          >
            <FaChevronDown size={20} />
          </motion.button>
          <span className="text-xs mt-1 dark:text-gray-300">Config</span>
        </div>
      </div>
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-200 h-screen">
        <motion.div
          className={clsx(
            'flex-1 w-full rounded-2xl shadow-xl p-6 overflow-y-auto',
            isDarkMode ? 'bg-slate-800 bg-opacity-50 text-white' : 'bg-white text-gray-800',
            'flex flex-col items-center justify-center'
          )}
        >
          <AnimatePresence>
            {!isSessionActive && (
              <motion.div
                className="relative w-full h-64 sm:h-80 md:h-96 mb-6 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <canvas ref={visualizerCanvas} className="absolute top-0 left-0 w-full h-full rounded" aria-label="Background Animation Canvas" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="w-full max-w-5xl mb-6">
            <textarea
              className="w-full h-48 p-4 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-white bg-transparent"
              value={answerResult || ''}
              readOnly
              aria-label="AI Feedback"
              style={{ resize: 'none' }}
            />
          </div>
          {questionStem && (
            <div className="w-full max-w-5xl mb-6 p-6 bg-white bg-opacity-20 backdrop-blur-md rounded-lg shadow-md overflow-y-scroll text-center">
              <h3 className="text-2xl font-semibold text-white mb-2">Law Question</h3>
              <h3 className="text-sm font-medium text-gray-200 mb-1">LExAPI</h3>
              <small className="text-gray-300 italic">Version 3.0</small>
              <div className="text-gray-100 mb-4 whitespace-pre-wrap">
                {showHighlights && highlightedSections?.length
                  ? highlightedSections.map((section, idx) =>
                      section.highlight ? (
                        <motion.span
                          key={idx}
                          style={{
                            backgroundColor: `hsla(${tutorConfig.highlightHue}, 100%, 50%, ${tutorConfig.highlightOpacity})`,
                            display: 'inline-block',
                            transformOrigin: 'left center'
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
                  : questionStem}
              </div>
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
          {questionStem && currentQuestionCount < tutorConfig.questionLimit && (
            <div className="w-full max-w-5xl mb-6 text-center">
              {!answerResult ? (
                <textarea
                  className={clsx(
                    'w-full p-4 border',
                    isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-800',
                    'rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200'
                  )}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your answer here..."
                  rows={6}
                  disabled={isLoading}
                  aria-label="Answer Input"
                />
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
              <div className="flex flex-row gap-4 mt-4">
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
          {!questionStem && !questionText && (
            <div className={clsx(
              "w-full max-w-5xl p-6 backdrop-blur-md rounded-lg shadow-md text-center",
              isDarkMode ? "bg-slate-800 bg-opacity-50" : "bg-white bg-opacity-50"
            )}>
              <p className={clsx("mb-4", isDarkMode ? "text-white" : "text-slate-700")}>
                Click <span className="font-semibold">&quot;Configure AI Tutor&quot;</span> to start.
              </p>
              <p className={clsx("text-sm", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                <strong>Note:</strong> This AI Tutor helps you practice law school concepts, offers structured feedback, and references key principles or statutes.
                It’s not a substitute for professional legal advice.
              </p>
            </div>
          )}
          {isConfigModalOpen && (
            <motion.div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="bg-gray-800 p-8 rounded-lg w-11/12 max-w-md shadow-lg overflow-y-auto max-h-screen" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-semibold text-white mb-6">Configure AI Tutor</h2>
                <form>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Custom Prompt / Topic (Optional):</label>
                    <input type="text" name="userPrompt" value={tutorConfig.userPrompt} onChange={handleConfigChange} placeholder="e.g. 'Negligence in Torts' or 'Offer & Acceptance'" className="w-full p-3 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 bg-gray-700 text-white" aria-label="Custom Prompt" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Law School Year:</label>
                    <select name="studyYear" value={tutorConfig.studyYear} onChange={handleConfigChange} className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Select Law School Year">
                      {Object.keys(studyMapping).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Course:</label>
                    <select name="course" value={tutorConfig.course} onChange={handleConfigChange} className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Select Course">
                      {topicOptions.map((t, idx) => (
                        <option key={idx} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Sub-Topic:</label>
                    <select name="subTopic" value={tutorConfig.subTopic} onChange={handleConfigChange} className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Select Sub-topic">
                      {subTopicOptions.map((sub, idx) => (
                        <option key={idx} value={sub.value}>
                          {sub.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Complexity Level:</label>
                    <select name="complexity" value={tutorConfig.complexity} onChange={handleConfigChange} className="w-full p-3 border border-gray-500 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Select Complexity">
                      {complexityOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 font-semibold">Additional Aids for Law Students:</label>
                    <div className="flex items-center mb-2">
                      <input type="checkbox" id="showLegalReferences" name="showLegalReferences" checked={tutorConfig.showLegalReferences} onChange={handleConfigChange} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="showLegalReferences" className="ml-3 text-gray-300">Show references to relevant legal principles</label>
                    </div>
                    <div className="flex items-center mb-2">
                      <input type="checkbox" id="provideApproach" name="provideApproach" checked={tutorConfig.provideApproach} onChange={handleConfigChange} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="provideApproach" className="ml-3 text-gray-300">Provide a structured approach to solving the problem</label>
                    </div>
                    <div className="flex items-center mb-2">
                      <input type="checkbox" id="includeKeyCases" name="includeKeyCases" checked={tutorConfig.includeKeyCases} onChange={handleConfigChange} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="includeKeyCases" className="ml-3 text-gray-300">Include references to key cases</label>
                    </div>
                    <div className="flex items-center mb-2">
                      <input type="checkbox" id="includeStatutes" name="includeStatutes" checked={tutorConfig.includeStatutes} onChange={handleConfigChange} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="includeStatutes" className="ml-3 text-gray-300">Include relevant statutes or code sections</label>
                    </div>
                    <div className="flex items-center mb-2">
                      <input type="checkbox" id="liveMode" name="liveMode" checked={tutorConfig.liveMode} onChange={handleConfigChange} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="liveMode" className="ml-3 text-gray-300">Live Mode (Show highlights before answering)</label>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Highlight Color Hue:</label>
                    <div className="flex items-center space-x-4">
                      <input type="range" min="0" max="360" value={tutorConfig.highlightHue} onChange={(e) => setTutorConfig((prev) => ({ ...prev, highlightHue: parseInt(e.target.value, 10) }))} className="h-2 w-full bg-blue-400 rounded-lg appearance-none cursor-pointer" />
                      <div className="w-10 h-10 rounded" style={{ backgroundColor: `hsl(${tutorConfig.highlightHue}, 100%, 50%)` }} />
                    </div>
                    <p className="text-sm mt-2 text-gray-300">Adjust the hue to change the highlight color (default is neon yellow).</p>
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Number of Questions per Session:</label>
                    <div className="flex items-center">
                      <input type="range" min="1" max="20" value={tutorConfig.questionLimit} onChange={(e) => setTutorConfig((prev) => ({ ...prev, questionLimit: parseInt(e.target.value, 10) }))} className="w-full h-2 bg-blue-400 rounded-lg appearance-none cursor-pointer" aria-label="Set Number of Questions" />
                      <span className="ml-4 text-gray-300">{tutorConfig.questionLimit}</span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button type="button" onClick={handleStartTutoringSession} className="relative h-12 w-full sm:w-56 overflow-hidden rounded bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg transition-colors duration-200" aria-label="Start Tutoring Session">
                      Start Tutoring
                    </button>
                    <button type="button" onClick={closeConfigModal} className="px-6 py-3 bg-gray-600 text-gray-200 rounded hover:bg-gray-700 transition-colors duration-200" aria-label="Cancel Configuration">
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
          {isFinalFeedbackModalOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div className="bg-gray-800 p-8 rounded-lg w-11/12 max-w-3xl shadow-lg max-h-[80vh] overflow-y-auto" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-semibold text-white mb-6">Session Feedback</h2>
                <ul className="space-y-4">
                  {answeredQuestions.map((item, idx) => (
                    <li key={idx} className="p-4 border border-gray-700 rounded">
                      <p className="font-semibold text-blue-300">Question {idx + 1}:</p>
                      <p className="text-gray-200 mb-2">{item.question}</p>
                      <p className="text-gray-200 mb-1"><span className="font-semibold">Your Answer:</span> {item.answer}</p>
                      <p className="text-gray-200 mb-1"><span className="font-semibold">Feedback:</span> {item.feedback}</p>
                      <p className={`font-semibold ${item.correct ? 'text-emerald-400' : 'text-red-400'}`}>{item.correct ? 'Correct ✅' : 'Incorrect ❌'}</p>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-center mt-6">
                  <button type="button" onClick={() => setIsFinalFeedbackModalOpen(false)} className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200" aria-label="Close Final Feedback Modal">
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
          {isLoadProgressModalOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[151]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={clsx('bg-gray-800 p-8 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-full', isDarkMode ? 'text-white' : 'text-gray-800')}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Load Saved Progress</h2>
                {savedProgresses.length === 0 ? (
                  <p className="text-center">No saved progress found.</p>
                ) : (
                  <ul className="space-y-4">
                    {savedProgresses.map((prog) => (
                      <li
                        key={prog.id}
                        className={clsx('p-4 border rounded', isDarkMode ? 'border-gray-700' : 'border-gray-300')}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between items-center">
                          <div className="text-center">
                            <p className="font-semibold text-blue-300 mb-1">
                              Law Year: {prog.tutorConfig?.studyYear}
                            </p>
                            <p className="text-sm text-gray-400">Course: {prog.tutorConfig?.course}</p>
                            <p className="text-sm text-gray-400">Sub-Topic: {prog.tutorConfig?.subTopic}</p>
                            <p className="text-sm text-gray-400">Complexity: {prog.tutorConfig?.complexity}</p>
                            <p className="text-sm text-gray-400">Questions: {prog.tutorConfig?.questionLimit}</p>
                            <p className="text-sm text-gray-400">Current Question: {prog.currentQuestionCount}</p>
                            <p className="text-sm text-gray-400">Saved on: {new Date(prog.timestamp).toLocaleString()}</p>
                          </div>
                          <div className="flex flex-col gap-2 mt-2 sm:mt-0">
                            <button onClick={() => handleLoadProgress(prog)} className="h-10 w-24 rounded bg-blue-600 text-white text-sm flex items-center justify-center transition-colors duration-200">
                              Load
                            </button>
                            <button onClick={() => handleDeleteProgress(prog.id)} className="h-10 w-24 rounded bg-red-600 text-white text-sm flex items-center justify-center transition-colors duration-200 hover:bg-red-700">
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
        </motion.div>
      </main>
    </div>
  );
}
