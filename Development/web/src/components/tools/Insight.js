'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import {
  doc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

import {
  CircularProgressbar,
  buildStyles
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function ExamInsight() {
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [subjectScoresByProgress, setSubjectScoresByProgress] = useState({});

  const lawSubjects = [
    'Contracts',
    'Torts',
    'CriminalLaw',
    'Property',
    'Evidence',
    'ConstitutionalLaw',
    'CivilProcedure',
    'BusinessAssociations',
  ];

  useEffect(() => {
    fetchSavedProgresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Open/Close Modal
  const openLoadProgressModal = () => setIsLoadProgressModalOpen(true);
  const closeLoadProgressModal = () => setIsLoadProgressModalOpen(false);

  // Fetch from Firestore
  const fetchSavedProgresses = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, 'examProgress'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);

      const progresses = [];
      snap.forEach((docSnapshot) => {
        progresses.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });

      // Sort progresses by timestamp ascending (oldest first)
      progresses.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setSavedProgresses(progresses);

      // Compute scores for all fetched progresses
      progresses.forEach((progress) => {
        computeSubjectScores(progress);
      });

    } catch (error) {
      console.error('Error fetching progress docs:', error);
      alert('Error fetching progress data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProgress = async (id) => {
    if (!currentUser) {
      alert('You must be logged in to delete progress.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'examProgress', id));
      fetchSavedProgresses(); // Refresh
    } catch (error) {
      console.error('Error deleting progress:', error);
      alert('Error deleting progress.');
    }
  };

  // Functionality to handle loading a saved progress
  const handleLoadProgress = (progress) => {
    console.log('Loading progress:', progress);
    closeLoadProgressModal();
    // Add your loading logic or routing here
  };

  // Example of additional functionality: Export progress to CSV (simple approach)
  const handleExportCSV = (progress) => {
    try {
      const rows = [];
      rows.push(['Exam Type', 'Subject', 'Difficulty', 'Question Limit', 'Current Question Count', 'Timestamp']);
      rows.push([
        progress.examConfig?.examType || 'Practice Exam',
        progress.examConfig?.lawSubject || 'Contracts',
        progress.examConfig?.difficulty || 'Basic',
        progress.examConfig?.questionLimit || 5,
        progress.currentQuestionCount,
        new Date(progress.timestamp).toLocaleString(),
      ]);

      // Convert to CSV format
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        rows.map((e) => e.join(',')).join('\n');

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'exam_progress.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Error exporting to CSV.');
    }
  };

  function computeSubjectScores(progress) {
    // Overall
    const overallCorrect = progress.overallCorrect || 0;
    const overallTotal = progress.overallTotal || 0;
    const overallPct = overallTotal ? Math.round((overallCorrect / overallTotal) * 100) : 0;

    // Categories
    const cat = progress.categories || {};
    const result = [];
    lawSubjects.forEach((subj) => {
      if (cat[subj]) {
        const correct = cat[subj].correct || 0;
        const total = cat[subj].total || 0;
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
        result.push({ subjectName: subj, percentage: pct });
      } else {
        result.push({ subjectName: subj, percentage: 0 });
      }
    });

    setSubjectScoresByProgress((prev) => ({
      ...prev,
      [progress.id]: {
        overallPct,
        subjects: result,
      },
    }));
  }

  // If user not logged in
  if (!currentUser) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-800'
        }`}
      >
        <div className="p-6 rounded shadow-md text-center">
          <p className="mb-4">Please log in to view Exam Insights.</p>
          <button
            onClick={() => window.location.assign('/login')}
            className={`px-4 py-2 rounded ${
              isDarkMode
                ? 'bg-blue-700 hover:bg-blue-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Define styles for the overall progress circle
  const overallStyles = buildStyles({
    pathColor: `rgba(255, 0, 135, 0.9)`, // Neon pinkish
    textColor: 'transparent', // Hide default text
    trailColor: isDarkMode ? '#4B5563' : '#E5E7EB',
    strokeLinecap: 'round',
  });

  // Define styles for subject progress circles based on percentage
  function subjectStyles(percentage) {
    const color = percentage >= 70 ? '#4CAF50' : '#F59E0B'; // Green if >=70%, else orange
    return buildStyles({
      pathColor: color,
      textColor: 'transparent', // Hide default text
      trailColor: isDarkMode ? '#4B5563' : '#E5E7EB',
      strokeLinecap: 'butt',
    });
  }

  // Helper function to calculate change compared to previous progress
  const calculateChange = (currentPct, previousPct) => {
    if (previousPct === null) return null;
    return currentPct - previousPct;
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-transparent'}`}>
      {/* Sidebar */}
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

      {/* Main content area */}
      <main className="flex-1 h-full overflow-auto">
        {/* Top header row */}
        <div className="flex items-center justify-between p-4 sm:p-6">
          <button
            onClick={toggleSidebar}
            className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'} hover:text-white`}
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
            className={`relative h-10 sm:h-12 w-28 sm:w-36 overflow-hidden rounded ${
              isDarkMode ? 'bg-blue-700' : 'bg-blue-950'
            } text-white shadow-lg transition-colors duration-200
            before:absolute before:right-0 before:top-0 before:h-full before:w-5 before:translate-x-12 before:rotate-6
            before:bg-white before:opacity-20 before:duration-700 hover:before:-translate-x-56 text-sm sm:text-base`}
            aria-label="Load Progress"
          >
            Load Progress
          </button>
        </div>

        {/* Main Container */}
        <div className={`px-4 pb-6 sm:px-6 lg:px-8 w-full h-auto`}>
          <h2
            className={`text-2xl font-semibold mb-6 ${
              isDarkMode ? 'text-white' : 'text-blue-900'
            }`}
          >
            Exam Insight &amp; Analysis
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {savedProgresses.length > 0 ? (
                savedProgresses.map((prog, index) => {
                  const pid = prog.id;
                  const data = subjectScoresByProgress[pid] || { overallPct: 0, subjects: [] };
                  const { overallPct, subjects } = data;

                  // Determine previous progress for change calculation
                  const previousProg = index > 0 ? savedProgresses[index - 1] : null;
                  const previousData = previousProg ? subjectScoresByProgress[previousProg.id] : null;
                  const change = previousData ? overallPct - previousData.overallPct : null;

                  return (
                    <div
                      key={pid}
                      className={`rounded p-4 transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-transparent'
                      }`}
                    >
                      {/* Top row: Title and optional buttons (Export, etc.) */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div>
                          <h3
                            className={`text-xl font-semibold mb-1 ${
                              isDarkMode ? 'text-gray-100' : 'text-blue-800'
                            }`}
                          >
                            {prog.examConfig?.examType || 'Practice Exam'} -{' '}
                            {prog.examConfig?.lawSubject || 'Contracts'}
                          </h3>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                            Difficulty: {prog.examConfig?.difficulty || 'Basic'}
                          </p>
                        </div>
                        <div className="flex flex-row gap-2 mt-2 sm:mt-0">
                          <button
                            onClick={() => handleExportCSV(prog)}
                            className={`h-9 px-3 rounded ${
                              isDarkMode
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } text-sm`}
                            aria-label="Export to CSV"
                          >
                            Export CSV
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(prog.id)}
                            className={`h-9 px-3 rounded ${
                              isDarkMode
                                ? 'bg-red-700 text-white hover:bg-red-600'
                                : 'bg-red-600 text-white hover:bg-red-500'
                            } text-sm`}
                            aria-label="Delete Progress"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Saved on:</strong>{' '}
                        {prog.timestamp ? new Date(prog.timestamp).toLocaleString() : 'Unknown'}
                      </p>

                      {/* Two-column layout: Left = Overall circle, Right = subject circles */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Overall Performance */}
                        <div className="flex flex-col items-center justify-center">
                          <div style={{ position: 'relative', width: 240, height: 240 }}>
                            <CircularProgressbar
                              value={overallPct}
                              text={`0%`}
                              strokeWidth={2}
                              styles={overallStyles}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                              }}
                            >
                              <span className="block text-base font-semibold">{`${overallPct} out of 100`}</span>
                                <span
                                  className={`block text-lg font-semibold ${
                                    change >= 0 ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {`Change: ${change >= 0 ? '+' : ''}${change}`}
                                </span>
                              <span className="block text-sm font-medium">{`${overallPct}th percentile`}</span>
                            </div>
                          </div>
                          <p
                            className={`mt-2 text-sm font-semibold ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}
                          >
                            Overall Performance
                          </p>
                        </div>

                        {/* Subject Performance (circular progress for each) */}
                        <div className="flex flex-wrap justify-center items-center gap-6">
                          {subjects.map((item) => {
                            const { subjectName, percentage } = item;
                            // Determine previous subject percentage
                            let prevSubjPercentage = null;
                            if (previousProg && previousProg.categories && previousProg.categories[subjectName]) {
                              prevSubjPercentage = Math.round(
                                (previousProg.categories[subjectName].correct /
                                  previousProg.categories[subjectName].total) *
                                  100
                              );
                            }
                            const subjChange =
                              prevSubjPercentage !== null ? percentage - prevSubjPercentage : null;

                            return (
                              <div
                                key={subjectName}
                                className="flex flex-col items-center justify-center"
                              >
                                <div style={{ position: 'relative', width: 180, height: 180 }}>
                                  <CircularProgressbar
                                    value={percentage}
                                    text={`0%`}
                                    strokeWidth={2}
                                    styles={subjectStyles(percentage)}
                                  />
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      textAlign: 'center',
                                    }}
                                  >
                                    <span className="block text-sm font-semibold">{`${percentage} out of 100`}</span>
                                      <span
                                        className={`block text-sm font-semibold ${
                                          subjChange >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`}
                                      >
                                        {`Change: ${subjChange >= 0 ? '+' : ''}${subjChange}`}
                                      </span>
                                    <span className="block text-xs font-medium">{`${percentage}th percentile`}</span>
                                  </div>
                                </div>
                                <p
                                  className={`mt-2 text-xs font-semibold ${
                                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                  }`}
                                >
                                  {subjectName}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Display default progress bars with 0% when no progresses are loaded
                <div className="space-y-8">
                  <div
                    className={`p-4 rounded shadow-lg transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    {/* Top row: Title */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3
                          className={`text-xl font-semibold mb-1 ${
                            isDarkMode ? 'text-gray-200' : 'text-blue-800'
                          }`}
                        >
                          No Saved Exam Progress
                        </h3>
                      </div>
                    </div>

                    {/* Overall Circle (bigger) */}
                    <div className="flex flex-col items-center mb-6">
                      <div style={{ position: 'relative', width: 120, height: 120 }}>
                        <CircularProgressbar
                          value={0}
                          text={`0%`}
                          strokeWidth={2}
                          styles={overallStyles}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                          }}
                        >
                          <span className="block text-base font-semibold">{`0 out of 100`}</span>
                          <span className="block text-lg font-semibold text-green-400">{`Change: N/A`}</span>
                          <span className="block text-sm font-medium">{`0 percentile`}</span>
                        </div>
                      </div>
                      <p
                        className={`mt-2 text-sm font-semibold ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}
                      >
                        Overall Performance
                      </p>
                    </div>

                    {/* Smaller circles for each subject */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center">
                      {lawSubjects.map((subjectName) => (
                        <div key={subjectName} className="flex flex-col items-center">
                          <div style={{ position: 'relative', width: 70, height: 70 }}>
                            <CircularProgressbar
                              value={0}
                              text={`0%`}
                              strokeWidth={2}
                              styles={subjectStyles(0)}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                              }}
                            >
                              <span className="block text-sm font-semibold">{`0 out of 100`}</span>
                              <span className="block text-md font-semibold text-green-400">{`Change: N/A`}</span>
                              <span className="block text-xs font-medium">{`0 percentile`}</span>
                            </div>
                          </div>
                          <p
                            className={`mt-2 text-xs font-semibold ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}
                          >
                            {subjectName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Load Progress Modal */}
      <AnimatePresence>
        {isLoadProgressModalOpen && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[180]`}
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
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading...</p>
              ) : savedProgresses.length === 0 ? (
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div className="mb-2 sm:mb-0">
                          <p
                            className={`font-semibold ${
                              isDarkMode ? 'text-cyan-300' : 'text-blue-900'
                            }`}
                          >
                            Exam Type: {progress.examConfig?.examType || 'Practice Exam'}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Law Subject: {progress.examConfig?.lawSubject || 'Contracts'}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Difficulty: {progress.examConfig?.difficulty || 'Basic'}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Questions: {progress.examConfig?.questionLimit || 5}
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
                            Saved on: {new Date(progress.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-row space-x-2">
                          <button
                            onClick={() => handleLoadProgress(progress)}
                            className="h-10 w-20 sm:w-24 overflow-hidden rounded bg-blue-600 text-white shadow-lg transition-colors duration-200 hover:bg-blue-500 text-sm sm:text-base"
                            aria-label="Load Progress"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProgress(progress.id)}
                            className="h-10 w-20 sm:w-24 overflow-hidden rounded bg-red-600 text-white shadow-lg transition-colors duration-200 hover:bg-red-500 text-sm sm:text-base"
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
                  className={`h-10 sm:h-12 px-6 py-2 rounded ${
                    isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  } transition-colors duration-200 text-sm sm:text-base`}
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
