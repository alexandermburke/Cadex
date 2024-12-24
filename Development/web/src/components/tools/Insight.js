'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { Pie, Bar as ChartBar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';

import { useAuth } from '@/context/AuthContext';
import {
  doc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend
);

export default function ExamInsight() {
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);
  const [selectedProgresses, setSelectedProgresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Track how many correct/incorrect answers for each progress
  const [correctAnswersCount, setCorrectAnswersCount] = useState({});
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState({});
  // Track question type distribution for each progress
  const [questionTypeDistribution, setQuestionTypeDistribution] = useState({});
  // Track performance over time for each progress
  const [performanceOverTime, setPerformanceOverTime] = useState({});
  // Track recommended schools for each progress
  const [recommendedUniversities, setRecommendedUniversities] = useState({});
  const [isRecommending, setIsRecommending] = useState(false);

  // We'll store the last opened progress ID in local storage
  useEffect(() => {
    const lastProgressId = localStorage.getItem('lastProgressId');
    if (lastProgressId) {
      fetchSavedProgresses(true, lastProgressId);
    } else {
      fetchSavedProgresses(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const openLoadProgressModal = () => {
    setIsLoadProgressModalOpen(true);
  };

  const closeLoadProgressModal = () => {
    setIsLoadProgressModalOpen(false);
  };

  /**
   * fetchSavedProgresses:
   * - If autoLoadLast is true, tries to load the doc with id = lastProgressId.
   */
  const fetchSavedProgresses = async (
    autoLoadLast = false,
    lastProgressId = ''
  ) => {
    if (!currentUser) {
      return;
    }
    setIsLoading(true);

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

      if (autoLoadLast && lastProgressId) {
        const matching = progresses.find((p) => p.id === lastProgressId);
        if (matching) {
          // If we haven't selected it yet, load it
          if (!selectedProgresses.find((sp) => sp.id === lastProgressId)) {
            setSelectedProgresses([matching]);
            analyzeProgress(matching);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching saved progresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadProgress = (progress) => {
    // If not already in selectedProgresses, add it
    const alreadySelected = selectedProgresses.find(
      (p) => p.id === progress.id
    );
    if (!alreadySelected) {
      setSelectedProgresses((prev) => [...prev, progress]);
    }
    // Save the last opened progress ID
    localStorage.setItem('lastProgressId', progress.id);
  };

  const handleDeleteProgress = async (id) => {
    if (!currentUser) {
      alert('You need to be logged in to delete your progress.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'examProgress', id));
      // Refresh the savedProgress list
      fetchSavedProgresses();
      // Also remove from selected progress if it's there
      setSelectedProgresses((prev) => prev.filter((p) => p.id !== id));

      // If the lastProgressId was this doc, remove from localStorage
      const lastProgressId = localStorage.getItem('lastProgressId');
      if (lastProgressId === id) {
        localStorage.removeItem('lastProgressId');
      }
    } catch (error) {
      console.error('Error deleting progress:', error);
      alert('An error occurred while deleting the progress.');
    }
  };

  // Whenever a new progress is added to selectedProgresses, analyze it
  useEffect(() => {
    selectedProgresses.forEach((progress) => {
      analyzeProgress(progress);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgresses]);

  const analyzeProgress = (progress) => {
    const answered = progress.answeredQuestions || [];
    let correct = 0;
    let incorrect = 0;
    const typeDistribution = {};
    const performanceTimeline = [];

    answered.forEach((q) => {
      if (q.correct) correct++;
      else incorrect++;

      const qType = q.questionType || 'Unknown';
      if (!typeDistribution[qType]) {
        typeDistribution[qType] = 1;
      } else {
        typeDistribution[qType]++;
      }

      // Performance Over Time
      const timestamp = new Date(q.timestamp || progress.timestamp);
      const date = `${timestamp.getMonth() + 1}/${timestamp.getDate()}`;
      performanceTimeline.push({ date, correct: q.correct ? 1 : 0 });
    });

    const progressId = progress.id;
    setCorrectAnswersCount((prev) => ({ ...prev, [progressId]: correct }));
    setIncorrectAnswersCount((prev) => ({ ...prev, [progressId]: incorrect }));

    // Build performance map
    const perfMap = {};
    performanceTimeline.forEach((entry) => {
      if (!perfMap[entry.date]) {
        perfMap[entry.date] = { total: 0, correct: 0 };
      }
      perfMap[entry.date].total++;
      perfMap[entry.date].correct += entry.correct;
    });

    const sortedDates = Object.keys(perfMap).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const perfData = sortedDates.map((date) => ({
      date,
      accuracy: Number(
        ((perfMap[date].correct / perfMap[date].total) * 100).toFixed(2)
      ),
    }));

    setPerformanceOverTime((prev) => ({
      ...prev,
      [progressId]: perfData,
    }));

    setQuestionTypeDistribution((prev) => ({
      ...prev,
      [progressId]: typeDistribution,
    }));

    // Finally, fetch recommended schools
    const totalAnswers = correct + incorrect;
    const accuracy = totalAnswers ? (correct / totalAnswers) * 100 : 0;
    recommendLawSchools(progressId, accuracy);
  };

  const recommendLawSchools = async (progressId, accuracy) => {
    setIsRecommending(true);
    try {
      const response = await fetch('/api/recommend-law-schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accuracy }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations.');
      }

      const data = await response.json();
      setRecommendedUniversities((prev) => ({ ...prev, [progressId]: data }));
    } catch (error) {
      console.error('Error recommending law schools:', error);
      setRecommendedUniversities((prev) => ({ ...prev, [progressId]: [] }));
    } finally {
      setIsRecommending(false);
    }
  };

  // Chart Colors / Minimal styling
  const chartColors = {
    pie: {
      correct: isDarkMode ? '#6EE7B7' : '#4CAF50', // success-green variants
      incorrect: isDarkMode ? '#FCA5A5' : '#F44336', // error-red variants
    },
    bar: {
      background: isDarkMode ? '#A5B4FC' : '#3F51B5', // Indigo-ish
    },
    line: {
      background: isDarkMode ? '#f9a8d4' : '#E91E63', // Pink-ish
    },
    axisColor: isDarkMode ? '#FFFFFF' : '#000000',
    gridColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  };

  // Pie Chart (Performance Overview)
  const getPieData = (pid) => {
    const correct = correctAnswersCount[pid] || 0;
    const incorrect = incorrectAnswersCount[pid] || 0;
    return {
      labels: ['Correct', 'Incorrect'],
      datasets: [
        {
          data: [correct, incorrect],
          backgroundColor: [chartColors.pie.correct, chartColors.pie.incorrect],
          borderWidth: 1,
          borderColor: isDarkMode ? '#222' : '#ccc',
        },
      ],
    };
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: chartColors.axisColor,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#333' : '#fff',
        titleColor: isDarkMode ? '#fff' : '#000',
        bodyColor: isDarkMode ? '#fff' : '#000',
      },
    },
  };

  // Bar Chart (Question Distribution)
  const getBarData = (pid) => {
    const distribution = questionTypeDistribution[pid] || {};
    return {
      labels: Object.keys(distribution),
      datasets: [
        {
          label: 'Questions',
          data: Object.values(distribution),
          backgroundColor: chartColors.bar.background,
        },
      ],
    };
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: chartColors.axisColor,
        },
        grid: {
          color: chartColors.gridColor,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: chartColors.axisColor,
          stepSize: 1,
        },
        grid: {
          color: chartColors.gridColor,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: chartColors.axisColor,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#333' : '#fff',
        titleColor: isDarkMode ? '#fff' : '#000',
        bodyColor: isDarkMode ? '#fff' : '#000',
      },
    },
  };

  // Line Chart (Performance Over Time)
  const getLineData = (pid) => {
    const perf = performanceOverTime[pid] || [];
    return {
      labels: perf.map((p) => p.date),
      datasets: [
        {
          label: 'Accuracy (%)',
          data: perf.map((p) => p.accuracy),
          borderColor: chartColors.line.background,
          backgroundColor: 'transparent',
          pointBackgroundColor: chartColors.line.background,
          pointHoverRadius: 5,
          tension: 0.2,
        },
      ],
    };
  };
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: chartColors.axisColor,
        },
        grid: {
          color: chartColors.gridColor,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: chartColors.axisColor,
        },
        grid: {
          color: chartColors.gridColor,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: chartColors.axisColor,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#333' : '#fff',
        titleColor: isDarkMode ? '#fff' : '#000',
        bodyColor: isDarkMode ? '#fff' : '#000',
      },
    },
  };

  // Slick slider settings for chart carousel
  const chartSettings = {
    centerMode: true,
    infinite: true,
    centerPadding: '0px',
    slidesToShow: 1,
    speed: 500,
    autoplay: false,
    dots: true,
    arrows: false,
    adaptiveHeight: true,
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded shadow-md`}>
      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <Sidebar
              activeLink="/ailawtools/insights"
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

      <main className="flex-1 flex flex-col items-center p-6 overflow-auto">
        {/* Top row: Toggle sidebar, load progress button */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-6">
          <button
            onClick={toggleSidebar}
            className={`${
              isDarkMode ? 'text-gray-200' : 'text-gray-600'
            } hover:text-white`}
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
            onClick={openLoadProgressModal}
            className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
            aria-label="Load Progress"
          >
            Load Progress
          </button>
        </div>

        {/* Main content box */}
        <div
          className={`w-full max-w-5xl p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow-md`}
        >
          <h2
            className={`text-2xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-blue-900'
            }`}
          >
            Exam Insight & Analysis
          </h2>

          {selectedProgresses.length > 0 ? (
            <div className="space-y-8">
              {selectedProgresses.map((prog) => {
                const pid = prog.id;

                return (
                  <div
                    key={pid}
                    className={`p-4 rounded transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-transparent'
                    }`}
                  >
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-blue-800'
                      }`}
                    >
                      {prog.examConfig.examType} - {prog.examConfig.lawType}
                    </h3>
                    <p
                      className={`${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      } mb-1`}
                    >
                      <strong>Difficulty:</strong> {prog.examConfig.difficulty}
                    </p>
                    <p
                      className={`${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      } mb-1`}
                    >
                      <strong>Questions:</strong>{' '}
                      {prog.examConfig.flashcardLimit ||
                        prog.examConfig.questionLimit}
                    </p>
                    <p
                      className={`${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      } mb-1`}
                    >
                      <strong>Instant Feedback:</strong>{' '}
                      {prog.examConfig.instantFeedback ? 'Enabled' : 'Disabled'}
                    </p>
                    <p
                      className={`${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      } mb-4`}
                    >
                      <strong>Saved on:</strong>{' '}
                      {new Date(prog.timestamp).toLocaleString()}
                    </p>

                    {/* CHART CAROUSEL */}
                    <div style={{ height: '320px' /* to fix chart size */ }}>
                      <Slider {...chartSettings}>
                        {/* Slide 1: Pie Chart */}
                        <div
                          className="p-2"
                          style={{ background: 'transparent', height: '300px' }}
                        >
                          <h4
                            className={`text-center mb-2 ${
                              isDarkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}
                          >
                            Performance Overview
                          </h4>
                          <div className="h-full relative">
                            <Pie data={getPieData(pid)} options={pieOptions} />
                          </div>
                        </div>

                        {/* Slide 2: Bar Chart */}
                        <div
                          className="p-2"
                          style={{ background: 'transparent', height: '300px' }}
                        >
                          <h4
                            className={`text-center mb-2 ${
                              isDarkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}
                          >
                            Question Distribution
                          </h4>
                          <div className="h-full relative">
                            <ChartBar
                              data={getBarData(pid)}
                              options={barOptions}
                            />
                          </div>
                        </div>

                        {/* Slide 3: Line Chart */}
                        <div
                          className="p-2"
                          style={{ background: 'transparent', height: '300px' }}
                        >
                          <h4
                            className={`text-center mb-2 ${
                              isDarkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}
                          >
                            Performance Over Time
                          </h4>
                          <div className="h-full relative">
                            <Line
                              data={getLineData(pid)}
                              options={lineOptions}
                            />
                          </div>
                        </div>
                      </Slider>
                    </div>

                    {/* Recommended Law Schools */}
                    <div className="mt-6">
                      <h4
                        className={`text-lg font-semibold mb-2 ${
                          isDarkMode ? 'text-gray-200' : 'text-blue-800'
                        }`}
                      >
                        Recommended Law Schools
                      </h4>
                      {isRecommending ? (
                        <p
                          className={`${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}
                        >
                          Generating recommendations...
                        </p>
                      ) : recommendedUniversities[pid] &&
                        recommendedUniversities[pid].length > 0 ? (
                        <ul className="list-disc list-inside ml-5 space-y-3">
                          {recommendedUniversities[pid].map((uni, idx) => {
                            // We'll keep the colored text to highlight notes
                            const notesClass = uni.notes.includes('(More Likely)')
                              ? 'text-emerald-400'
                              : 'text-red-400';
                            return (
                              <li
                                key={idx}
                                className={`${
                                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                }`}
                              >
                                <span className="font-semibold">{uni.name}</span>{' '}
                                <span className={`ml-2 opacity-90 ${notesClass}`}>
                                  {uni.notes}
                                </span>
                                <div className="text-sm mt-1 ml-4 opacity-90">
                                  {uni.brief}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p
                          className={`${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}
                        >
                          No recommendations available.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center">
              <p
                className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                Please load one or more saved progresses to view insights and
                analysis.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* LOAD PROGRESS MODAL */}
      <AnimatePresence>
        {isLoadProgressModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[180]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } p-8 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-screen`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className={`text-2xl font-semibold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                Load Saved Progress
              </h2>
              {isLoading ? (
                <p
                  className={`${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Loading...
                </p>
              ) : savedProgresses.length === 0 ? (
                <p
                  className={`${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  No saved progresses found.
                </p>
              ) : (
                <ul className="space-y-4">
                  {savedProgresses.map((progress) => (
                    <li
                      key={progress.id}
                      className={`p-4 border ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      } rounded`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p
                            className={`font-semibold ${
                              isDarkMode ? 'text-cyan-300' : 'text-blue-900'
                            }`}
                          >
                            Exam Type: {progress.examConfig.examType}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Law Type: {progress.examConfig.lawType}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Difficulty: {progress.examConfig.difficulty}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Number of Questions:{' '}
                            {progress.examConfig.flashcardLimit ||
                              progress.examConfig.questionLimit}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Current Question: {progress.currentQuestionCount}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Saved on:{' '}
                            {new Date(progress.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleLoadProgress(progress)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors duration-200"
                            aria-label="Load Progress"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(progress.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors duration-200"
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
                  onClick={closeLoadProgressModal}
                  className={`px-6 py-3 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  } rounded transition-colors duration-200`}
                  aria-label="Close Load Progress Modal"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
