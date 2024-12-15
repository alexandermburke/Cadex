'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar'; // Ensure Sidebar component is correctly imported
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Pie, Bar as ChartBar } from 'react-chartjs-2'; // Import Bar from react-chartjs-2
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement, // Import BarElement for Bar charts
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

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement, // Register BarElement
    ArcElement,
    ChartTitle,
    Tooltip,
    Legend
);

export default function ExamInsight() {
    const { currentUser } = useAuth(); // Removed userDataObj if not used
    const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State to manage sidebar visibility
    const [isLoadProgressModalOpen, setIsLoadProgressModalOpen] = useState(false); // State to manage Load Progress modal
    const [savedProgresses, setSavedProgresses] = useState([]); // State to store saved progresses
    const [selectedProgress, setSelectedProgress] = useState(null); // State to store the selected progress for analysis
    const [isLoading, setIsLoading] = useState(false); // State to manage loading state
    const [areChartsVisible, setAreChartsVisible] = useState(true); // Toggle charts visibility

    // Chart Data States
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
    const [questionTypeDistribution, setQuestionTypeDistribution] = useState({});
    const [performanceOverTime, setPerformanceOverTime] = useState([]); // **Changed from {} to []**

    // Toggle Sidebar Visibility
    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    // Toggle Load Progress Modal
    const toggleLoadProgressModal = () => {
        setIsLoadProgressModalOpen(!isLoadProgressModalOpen);
    };

    // Toggle Charts Visibility
    const toggleChartsVisibility = () => {
        setAreChartsVisible(!areChartsVisible);
    };

    // Fetch Saved Progresses from Firestore
    const fetchSavedProgresses = async () => {
        if (!currentUser) {
            alert('You need to be logged in to load your progress.');
            return;
        }

        setIsLoading(true); // Start loading
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
        } finally {
            setIsLoading(false); // End loading
        }
    };

    // Handle Load Progress Modal Open
    const openLoadProgressModal = () => {
        fetchSavedProgresses();
        setIsLoadProgressModalOpen(true);
    };

    // Handle Load Progress Modal Close
    const closeLoadProgressModal = () => {
        setIsLoadProgressModalOpen(false);
    };

    // Handle Loading a Selected Progress
    const handleLoadProgress = (progress) => {
        setSelectedProgress(progress);
        setIsLoadProgressModalOpen(false);
    };

    // Handle Deleting a Progress
    const handleDeleteProgress = async (id) => {
        if (!currentUser) {
            alert('You need to be logged in to delete your progress.');
            return;
        }

        try {
            await deleteDoc(doc(db, 'examProgress', id));
            fetchSavedProgresses();
            // If the deleted progress was selected, reset the selection
            if (selectedProgress && selectedProgress.id === id) {
                setSelectedProgress(null);
            }
        } catch (error) {
            console.error('Error deleting progress:', error);
            alert('An error occurred while deleting the progress.');
        }
    };

    // Analyze Selected Progress
    useEffect(() => {
        if (selectedProgress) {
            analyzeProgress(selectedProgress);
        }
    }, [selectedProgress]);

    // Function to Analyze Progress
    const analyzeProgress = (progress) => {
        const answered = progress.answeredQuestions || [];
        let correct = 0;
        let incorrect = 0;
        const typeDistribution = {};
        const performanceTimeline = [];

        answered.forEach((q) => {
            if (q.correct) correct += 1;
            else incorrect += 1;

            const questionType = q.questionType || 'Unknown';
            if (typeDistribution[questionType]) {
                typeDistribution[questionType] += 1;
            } else {
                typeDistribution[questionType] = 1;
            }

            // Performance over time (Assuming timestamp is present)
            const timestamp = new Date(q.timestamp || progress.timestamp);
            const date = `${timestamp.getMonth() + 1}/${timestamp.getDate()}`;
            performanceTimeline.push({ date, correct: q.correct ? 1 : 0 });
        });

        setCorrectAnswersCount(correct);
        setIncorrectAnswersCount(incorrect);
        setQuestionTypeDistribution(typeDistribution);

        // Aggregate performance over time
        const performanceMap = {};
        performanceTimeline.forEach((entry) => {
            if (performanceMap[entry.date]) {
                performanceMap[entry.date].total += 1;
                performanceMap[entry.date].correct += entry.correct;
            } else {
                performanceMap[entry.date] = { total: 1, correct: entry.correct };
            }
        });

        const sortedDates = Object.keys(performanceMap).sort(
            (a, b) => new Date(a) - new Date(b)
        );

        const performanceData = sortedDates.map((date) => ({
            date,
            accuracy: ((performanceMap[date].correct / performanceMap[date].total) * 100).toFixed(2),
        }));

        setPerformanceOverTime(performanceData);
    };

    // Prepare Data for Charts

    const getPieChartData = () => {
        return {
            labels: ['Correct Answers', 'Incorrect Answers'],
            datasets: [
                {
                    data: [correctAnswersCount, incorrectAnswersCount],
                    backgroundColor: ['#4CAF50', '#F44336'],
                    hoverBackgroundColor: ['#66BB6A', '#E57373'],
                },
            ],
        };
    };

    const getPieChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    const getBarChartData = () => {
        return {
            labels: Object.keys(questionTypeDistribution),
            datasets: [
                {
                    label: '# of Questions',
                    data: Object.values(questionTypeDistribution),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    const getBarChartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    const getLineChartData = () => {
        return {
            labels: Array.isArray(performanceOverTime) ? performanceOverTime.map((entry) => entry.date) : [],
            datasets: [
                {
                    label: 'Accuracy (%)',
                    data: Array.isArray(performanceOverTime) ? performanceOverTime.map((entry) => entry.accuracy) : [],
                    fill: false,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    tension: 0.1,
                },
            ],
        };
    };

    const getLineChartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <div className="flex h-screen bg-gray-50 rounded drop-shadow-sm">
            {/* AnimatePresence for Sidebar */}
            <AnimatePresence>
                {isSidebarVisible && (
                    <>
                        {/* Sidebar Component */}
                        <Sidebar
                            activeLink="/ailawtools/predictive"
                            isSidebarVisible={isSidebarVisible}
                            toggleSidebar={toggleSidebar}
                        />

                        {/* Overlay */}
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

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center p-6 overflow-auto">
                {/* Header */}
                <div className="w-full max-w-5xl flex items-center justify-between mb-6">
                    {/* Animated Toggle Sidebar Button */}
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-600 hover:text-gray-800"
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

                    {/* Load Progress Button */}
                    <button
                        onClick={openLoadProgressModal}
                        className="px-4 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-800 transition-colors duration-200"
                        aria-label="Load Progress"
                    >
                        Load Progress
                    </button>
                </div>

                {/* Analysis Section */}
                <div className="w-full max-w-5xl p-6 bg-white rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-blue-900">Exam Insight & Analysis</h2>
                        <button
                            onClick={toggleChartsVisibility}
                            className="px-4 py-2 border border-solid border-blue-950 bg-white text-blue-950 rounded-md hover:bg-blue-950 hover:text-white transition-colors duration-200"
                        >
                            {areChartsVisible ? 'Hide Charts' : 'Show Charts'}
                        </button>
                    </div>

                    {selectedProgress ? (
                        areChartsVisible && (
                            <div>
                                {/* Summary */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Summary</h3>
                                    <p><strong>Exam Type:</strong> {selectedProgress.examConfig.examType}</p>
                                    <p><strong>Law Type:</strong> {selectedProgress.examConfig.lawType}</p>
                                    <p><strong>Difficulty:</strong> {selectedProgress.examConfig.difficulty}</p>
                                    <p><strong>Number of Questions:</strong> {selectedProgress.examConfig.questionLimit}</p>
                                    <p><strong>Instant Feedback:</strong> {selectedProgress.examConfig.instantFeedback ? 'Enabled' : 'Disabled'}</p>
                                    <p><strong>Timestamp:</strong> {new Date(selectedProgress.timestamp).toLocaleString()}</p>
                                </div>

                                {/* Correct vs Incorrect Pie Chart */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Performance Overview</h3>
                                    <Pie data={getPieChartData()} options={getPieChartOptions} />
                                </div>

                                {/* Question Type Distribution Bar Chart */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Question Type Distribution</h3>
                                    <ChartBar data={getBarChartData()} options={getBarChartOptions} />
                                </div>

                                {/* Performance Over Time Line Chart */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Performance Over Time</h3>
                                    <Line data={getLineChartData()} options={getLineChartOptions} />
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-center text-gray-500">
                            <p>Please load a saved progress to view insights and analysis.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Load Progress Modal */}
            <AnimatePresence>
                {isLoadProgressModalOpen && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[180]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white p-8 rounded-lg w-11/12 max-w-3xl shadow-lg overflow-y-auto max-h-screen"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-semibold mb-6">Load Saved Progress</h2>
                            {isLoading ? (
                                <p className="text-gray-700">Loading...</p>
                            ) : savedProgresses.length === 0 ? (
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
                                    onClick={closeLoadProgressModal}
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
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

    // Helper Components and Chart Configurations

    // No need for a separate Bar component since we're importing it directly from react-chartjs-2
    // If you have any custom configurations, you can add them here or directly use <ChartBar />
}
