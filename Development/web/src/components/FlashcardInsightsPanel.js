'use client';
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

const mainContainerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

const CircleBar = ({ percentage, size = 100, strokeWidth = 4, textSize = 16, color, label, isDarkMode }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="relative">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDarkMode ? "#444" : "#eee"}
          strokeWidth={0}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isDarkMode ? "#fff" : "#333"}
          fontSize={textSize}
          fontWeight="bold"
        >
          {percentage}%
        </text>
      </svg>
      {label && (
        <p className={`mt-2 text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {label}
        </p>
      )}
    </div>
  );
};

const OverallProgress = ({ percentage, isDarkMode }) => {
  const size = 240;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDarkMode ? "#444" : "#eee"}
            strokeWidth={0}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDarkMode ? "#4ade80" : "#10b981"}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isDarkMode ? "#fff" : "#333"}
            fontSize="24"
            fontWeight="bold"
          >
            {percentage}%
          </text>
        </svg>
      </div>
      <p className={`mt-4 text-base font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Overall Performance
      </p>
    </div>
  );
};

export default function ExamInsight() {
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;
  const [isLoading, setIsLoading] = useState(false);
  const [savedProgresses, setSavedProgresses] = useState([]);
  const [aggregatedScores, setAggregatedScores] = useState({ overall: 0, subjects: {} });

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

  const mainContainerClass = clsx('flex-1 flex flex-col px-6 relative z-200 h-screen');
  const contentContainerClass = clsx(
    'flex-1 w-full rounded-2xl p-6',
    isDarkMode ? 'bg-transparent text-white' : 'bg-transparent text-gray-800'
  );

  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'examProgress'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        const progresses = [];
        snap.forEach((docSnapshot) => {
          progresses.push({ id: docSnapshot.id, ...docSnapshot.data() });
        });
        setSavedProgresses(progresses);
        computeAggregatedScores(progresses);
      } catch (error) {
        console.error('Error fetching exam progress:', error);
        alert('Error fetching exam progress data.');
      } finally {
        setIsLoading(false);
      }
    };
    if (currentUser) {
      fetchProgress();
    }
  }, [currentUser]);

  const computeAggregatedScores = (progresses) => {
    let overallCorrect = 0, overallTotal = 0;
    const subjectTotals = {};
    lawSubjects.forEach((subject) => {
      subjectTotals[subject] = { correct: 0, total: 0 };
    });
    progresses.forEach((prog) => {
      overallCorrect += prog.overallCorrect || 0;
      overallTotal += prog.overallTotal || 0;
      const categories = prog.categories || {};
      lawSubjects.forEach((subject) => {
        if (categories[subject]) {
          subjectTotals[subject].correct += categories[subject].correct || 0;
          subjectTotals[subject].total += categories[subject].total || 0;
        }
      });
    });
    const overallPct = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : 0;
    const subjects = {};
    lawSubjects.forEach((subject) => {
      const { correct, total } = subjectTotals[subject];
      subjects[subject] = total > 0 ? Math.round((correct / total) * 100) : 0;
    });
    setAggregatedScores({ overall: overallPct, subjects });
  };

  return (
    <div className={clsx('relative flex h-screen transition-colors duration-500', isDarkMode ? 'text-white' : 'text-gray-800')}>
      <main className={mainContainerClass}>
        <motion.div className={contentContainerClass} variants={mainContainerVariants} initial="hidden" animate="visible">
          {!currentUser ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Please log in to view Exam Insights.</p>
                <button
                  onClick={() => window.location.assign('/login')}
                  className={clsx('mt-4 px-4 py-2 rounded', isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')}
                >
                  Go to Login
                </button>
              </div>
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Loading...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <OverallProgress percentage={aggregatedScores.overall} isDarkMode={isDarkMode} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {lawSubjects.map((subject) => (
                      <CircleBar
                        key={subject}
                        percentage={aggregatedScores.subjects[subject] || 0}
                        size={100}
                        strokeWidth={4}
                        textSize={16}
                        color={isDarkMode ? "#4ade80" : "#10b981"}
                        label={subject}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
