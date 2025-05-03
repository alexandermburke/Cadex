'use client';
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' } }
};

const lawSubjects = [
  'Contracts',
  'Torts',
  'CriminalLaw',
  'Property',
  'Evidence',
  'ConstitutionalLaw',
  'CivilProcedure',
  'BusinessAssociations'
];

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
          stroke={isDarkMode ? '#444' : '#eee'}
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
          fill={isDarkMode ? '#fff' : '#333'}
          fontSize={textSize}
          fontWeight="bold"
        >
          {percentage}%
        </text>
      </svg>
      <p className={`mt-2 text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {label}
      </p>
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
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDarkMode ? '#444' : '#eee'}
          strokeWidth={0}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDarkMode ? '#4ade80' : '#10b981'}
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
          fill={isDarkMode ? '#fff' : '#333'}
          fontSize="24"
          fontWeight="bold"
        >
          {percentage}%
        </text>
      </svg>
      <p className={`mt-4 text-base font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Overall Performance
      </p>
    </div>
  );
};

export default function ExamInsightsPanel() {
  const { currentUser, userDataObj } = useAuth();
  const isDarkMode = userDataObj?.darkMode || false;
  const [isLoading, setIsLoading] = useState(false);
  const [progresses, setProgresses] = useState([]);
  const [scores, setScores] = useState({ overall: 0, subjects: {} });

  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);
    (async () => {
      const q = query(collection(db, 'flashProgress'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => d.data());
      setProgresses(data);
      computeScores(data);
      setIsLoading(false);
    })();
  }, [currentUser]);

  const computeScores = (data) => {
    let totalCorrect = 0, total = 0;
    const subjectTotals = {};
    lawSubjects.forEach(sub => (subjectTotals[sub] = { correct: 0, total: 0 }));
    data.forEach(prog => {
      totalCorrect += prog.overallCorrect || 0;
      total += prog.overallTotal || 0;
      const cats = prog.categories || {};
      lawSubjects.forEach(sub => {
        if (cats[sub]) {
          subjectTotals[sub].correct += cats[sub].correct || 0;
          subjectTotals[sub].total += cats[sub].total || 0;
        }
      });
    });
    const overallPct = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
    const subjectScores = {};
    lawSubjects.forEach(sub => {
      const { correct, total } = subjectTotals[sub];
      subjectScores[sub] = total > 0 ? Math.round((correct / total) * 100) : 0;
    });
    setScores({ overall: overallPct, subjects: subjectScores });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 overflow-y-auto p-6"
    >
      {!currentUser ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Please log in to view Exam Insights.
            </p>
            <button
              onClick={() => window.location.assign('/login')}
              className={clsx(
                'mt-4 px-4 py-2 rounded',
                isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              )}
            >
              Go to Login
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Loading...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center">
            <OverallProgress percentage={scores.overall} isDarkMode={isDarkMode} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
            {lawSubjects.map((sub) => (
              <CircleBar
                key={sub}
                percentage={scores.subjects[sub]}
                color={isDarkMode ? '#4ade80' : '#10b981'}
                label={sub}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
